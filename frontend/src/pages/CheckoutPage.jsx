import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
const DEFAULT_SHIPPING_FEE = 50000
const SALES_CHANNEL_ID = 1

const CheckoutPage = () => {
  const navigate = useNavigate()
  const cart = useAppStore((state) => state.cart)
  const clearCart = useAppStore((state) => state.clearCart)
  const cartNote = useAppStore((state) => state.cartNote)
  const user = useAppStore((state) => state.user)
  const showToast = useAppStore((state) => state.showToast)
  const setAuthModal = useAppStore((state) => state.setAuthModal)

  const [form, setForm] = useState({
    fullName: '',
    address: '',
    phone: '',
    isPickup: false,
    paymentMethod: 'Cash',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [pendingCheckoutAfterLogin, setPendingCheckoutAfterLogin] = useState(false)
  const [voucherForm, setVoucherForm] = useState({ orderVoucherCode: '', shippingVoucherCode: '' })
  const [voucherQuote, setVoucherQuote] = useState(null)
  const [voucherFieldErrors, setVoucherFieldErrors] = useState({ order: '', shipping: '' })
  const [voucherFieldSuccess, setVoucherFieldSuccess] = useState({ order: '', shipping: '' })
  const [voucherLoading, setVoucherLoading] = useState({ order: false, shipping: false })
  const [availableVouchers, setAvailableVouchers] = useState([])
  const [isLoadingVoucherList, setIsLoadingVoucherList] = useState(false)
  const [bankPayment, setBankPayment] = useState(null)
  const [bankStatus, setBankStatus] = useState(null)
  const [transferContent, setTransferContent] = useState('')
  const [externalTransactionId, setExternalTransactionId] = useState('')
  const [isCreatingBankRequest, setIsCreatingBankRequest] = useState(false)
  const [isVerifyingBankPayment, setIsVerifyingBankPayment] = useState(false)
  const [isConfirmingBankOrder, setIsConfirmingBankOrder] = useState(false)
  const [bankCheckoutCompleted, setBankCheckoutCompleted] = useState(false)
  const bankPollingRef = useRef(null)
  const bankPaidToastShownRef = useRef(false)

  const vnd = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0)
  const itemsSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingFee = form.isPickup ? 0 : DEFAULT_SHIPPING_FEE
  const finalTotal = voucherQuote?.finalTotal ?? Math.max(0, itemsSubtotal + shippingFee)
  const transferAmount = bankPayment?.amount ?? finalTotal

  useEffect(() => {
    const loadVoucherList = async () => {
      try {
        setIsLoadingVoucherList(true)
        const res = await fetch(`${API_BASE}/api/vouchers/active-list`)
        if (!res.ok) {
          throw new Error('Không thể tải danh sách mã giảm giá')
        }

        const data = await res.json()
        setAvailableVouchers(Array.isArray(data) ? data : [])
      } catch {
        setAvailableVouchers([])
      } finally {
        setIsLoadingVoucherList(false)
      }
    }

    loadVoucherList()
  }, [])

  useEffect(() => {
    setVoucherFieldErrors({ order: '', shipping: '' })
    setVoucherFieldSuccess({ order: '', shipping: '' })
  }, [form.isPickup])

  useEffect(() => {
    if (form.paymentMethod !== 'BankTransfer') {
      setBankPayment(null)
      setBankStatus(null)
      setTransferContent('')
      setExternalTransactionId('')
      setBankCheckoutCompleted(false)
      if (bankPollingRef.current) {
        clearInterval(bankPollingRef.current)
        bankPollingRef.current = null
      }
    }
  }, [form.paymentMethod])

  const validateForm = () => {
    const newErrors = {}

    if (!form.fullName.trim()) newErrors.fullName = 'Họ tên không được để trống'
    if (!form.phone.trim()) newErrors.phone = 'Số điện thoại không được để trống'
    if (!form.paymentMethod) newErrors.paymentMethod = 'Vui lòng chọn hình thức thanh toán'

    const phoneNormalized = form.phone.replace(/[\s+-]/g, '')
    if (form.phone.trim() && !/^(0[3-9])[0-9]{8}$/.test(phoneNormalized)) {
      newErrors.phone = 'Số điện thoại phải là 10 chữ số và bắt đầu bằng 03, 04, 05, 07, 08 hoặc 09'
    }

    if (!form.isPickup && !form.address.trim()) {
      newErrors.address = 'Địa chỉ giao hàng không được để trống'
    }

    return newErrors
  }

  const getAuthHeaders = useCallback(() => {
    const headers = { 'Content-Type': 'application/json' }
    if (user?.role) headers['X-User-Role'] = user.role
    if (user?.accessToken) headers.Authorization = `Bearer ${user.accessToken}`
    return headers
  }, [user?.accessToken, user?.role])

  const buildCheckoutPayload = useCallback(() => ({
    userId: user.id,
    items: cart.map((item) => ({ perfumeId: item.id, quantity: item.quantity })),
    shippingAddress: form.isPickup ? 'NHAN TAI CUA HANG' : form.address,
    receiverPhone: form.phone,
    shippingFee,
    voucherCode: voucherForm.orderVoucherCode || voucherForm.shippingVoucherCode || null,
    orderVoucherCode: voucherForm.orderVoucherCode || null,
    shippingVoucherCode: voucherForm.shippingVoucherCode || null,
    salesChannelId: SALES_CHANNEL_ID,
    note: `[${form.isPickup ? 'PICKUP' : 'DELIVERY'}] Người nhận: ${form.fullName}${cartNote ? ` | Ghi chú: ${cartNote}` : ''}`,
    isPickup: form.isPickup,
    paymentMethod: form.paymentMethod,
  }), [cart, cartNote, form.address, form.fullName, form.isPickup, form.paymentMethod, form.phone, shippingFee, user?.id, voucherForm.orderVoucherCode, voucherForm.shippingVoucherCode])

  const completeBankTransferCheckout = useCallback(() => {
    if (bankCheckoutCompleted) return
    setBankCheckoutCompleted(true)
    if (!bankPaidToastShownRef.current) {
      bankPaidToastShownRef.current = true
      showToast('Thanh toán thành công. Đơn hàng đã được xác nhận.', 'success')
    }
    clearCart()
    navigate('/profile')
  }, [bankCheckoutCompleted, clearCart, navigate, showToast])

  const confirmPaidOrder = useCallback(async (paymentCode) => {
    if (!paymentCode || isConfirmingBankOrder || bankCheckoutCompleted) return

    setIsConfirmingBankOrder(true)
    try {
      const res = await fetch(`${API_BASE}/api/payments/bank-transfer/confirm/${encodeURIComponent(paymentCode)}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })
      const data = await res.json()

      if (!res.ok) {
        showToast(data.message || 'Không thể xác nhận đơn hàng sau thanh toán', 'error')
        return
      }

      setBankStatus((prev) => ({ ...prev, orderStatus: data.orderStatus || 'Confirmed' }))
      completeBankTransferCheckout()
    } catch {
      showToast('Lỗi kết nối khi xác nhận đơn hàng', 'error')
    } finally {
      setIsConfirmingBankOrder(false)
    }
  }, [bankCheckoutCompleted, completeBankTransferCheckout, getAuthHeaders, isConfirmingBankOrder, showToast])

  const checkBankTransferStatus = useCallback(async (paymentCode) => {
    if (!paymentCode || bankCheckoutCompleted) return

    try {
      const res = await fetch(`${API_BASE}/api/payments/bank-transfer/status/${encodeURIComponent(paymentCode)}`, {
        headers: getAuthHeaders(),
      })
      const data = await res.json()

      if (!res.ok) return

      setBankStatus(data)

      if (data?.isPaid) {
        if (data.orderStatus === 'Confirmed' || data.orderStatus === 'Placed') {
          completeBankTransferCheckout()
          return
        }

        await confirmPaidOrder(paymentCode)
      }
    } catch {
      // Polling should fail silently and try again in next cycle
    }
  }, [bankCheckoutCompleted, completeBankTransferCheckout, confirmPaidOrder, getAuthHeaders])

  const createBankTransferRequest = useCallback(async () => {
    if (cart.length === 0) {
      showToast('Giỏ hàng trống', 'error')
      return
    }

    setIsCreatingBankRequest(true)
    try {
      const res = await fetch(`${API_BASE}/api/payments/bank-transfer/request`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(buildCheckoutPayload()),
      })

      const data = await res.json()
      if (!res.ok) {
        showToast(data.message || 'Không thể tạo yêu cầu chuyển khoản', 'error')
        return
      }

      setBankPayment(data)
      setBankStatus({
        orderId: data.orderId,
        paymentCode: data.paymentCode,
        amount: data.amount,
        paidAmount: 0,
        isPaid: false,
        paymentStatus: data.status,
        orderStatus: 'PendingPayment',
        message: 'Đang chờ xác nhận thanh toán',
      })

      showToast('Đã tạo yêu cầu thanh toán. Vui lòng chuyển khoản theo QR.', 'success')
      await checkBankTransferStatus(data.paymentCode)
    } catch {
      showToast('Lỗi kết nối khi tạo yêu cầu thanh toán', 'error')
    } finally {
      setIsCreatingBankRequest(false)
    }
  }, [buildCheckoutPayload, cart.length, checkBankTransferStatus, getAuthHeaders, showToast])

  const verifyBankTransfer = useCallback(async () => {
    if (!bankPayment?.paymentCode) {
      showToast('Chưa có yêu cầu thanh toán để xác minh', 'error')
      return
    }

    if (!transferContent.trim()) {
      showToast('Vui lòng nhập nội dung chuyển khoản', 'error')
      return
    }

    setIsVerifyingBankPayment(true)
    try {
      const res = await fetch(`${API_BASE}/api/payments/bank-transfer/verify`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          paymentCode: bankPayment.paymentCode,
          paidAmount: bankPayment.amount,
          transferContent,
          destinationAccountNo: bankPayment.accountNo,
          externalTransactionId: externalTransactionId || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        showToast(data.message || 'Xác minh thanh toán thất bại', 'error')
        return
      }

      showToast('Đã xác minh thanh toán thành công', 'success')
      await checkBankTransferStatus(bankPayment.paymentCode)
    } catch {
      showToast('Lỗi kết nối khi xác minh thanh toán', 'error')
    } finally {
      setIsVerifyingBankPayment(false)
    }
  }, [bankPayment, checkBankTransferStatus, externalTransactionId, getAuthHeaders, showToast, transferContent])

  const submitCashOrder = useCallback(async () => {
    if (cart.length === 0) {
      showToast('Giỏ hàng trống', 'error')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/orders/batch`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(buildCheckoutPayload()),
      })

      const data = await res.json()
      if (res.ok) {
        clearCart()
        showToast('Đặt hàng thành công! Cảm ơn bạn.', 'success')
        navigate('/profile')
      } else {
        showToast(data.message || 'Lỗi đặt hàng', 'error')
      }
    } catch {
      showToast('Lỗi kết nối khi đặt hàng', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [
    cart,
    cartNote,
    clearCart,
    form.address,
    form.fullName,
    form.isPickup,
    form.phone,
    buildCheckoutPayload,
    getAuthHeaders,
    navigate,
    showToast,
    user,
  ])

  const executeCheckoutByMethod = useCallback(async () => {
    if (form.paymentMethod === 'BankTransfer') {
      if (!bankPayment) {
        await createBankTransferRequest()
      } else {
        showToast('Yêu cầu chuyển khoản đã được tạo. Vui lòng hoàn tất chuyển khoản và xác minh.', 'info')
      }
      return
    }

    await submitCashOrder()
  }, [bankPayment, createBankTransferRequest, form.paymentMethod, showToast, submitCashOrder])

  const normalizeVoucherType = (voucherType) => {
    if (String(voucherType || '').toLowerCase() === 'shipping') return 'Shipping'
    return 'Order'
  }

  const parseVoucherDate = (value) => {
    if (!value) return null
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const evaluateVoucherAvailability = useCallback((voucher) => {
    const now = new Date()
    const startAt = parseVoucherDate(voucher.startAt)
    const endAt = parseVoucherDate(voucher.endAt)
    const minOrderValue = Number(voucher.minOrderValue || 0)
    const totalRedemptions = Number(voucher.totalRedemptions || 0)
    const usageLimitTotal = voucher.usageLimitTotal == null ? null : Number(voucher.usageLimitTotal)
    const voucherType = normalizeVoucherType(voucher.voucherType)

    if (voucher.isDeleted || voucher.isActive === false) {
      return { disabled: true, reason: 'Voucher đã ngừng hoạt động' }
    }

    if (startAt && startAt > now) {
      return { disabled: true, reason: 'Voucher chưa đến thời gian áp dụng' }
    }

    if (endAt && endAt < now) {
      return { disabled: true, reason: 'Voucher đã hết hạn' }
    }

    if (usageLimitTotal != null && usageLimitTotal > 0 && totalRedemptions >= usageLimitTotal) {
      return { disabled: true, reason: 'Voucher đã hết lượt sử dụng' }
    }

    if (voucherType === 'Shipping' && form.isPickup) {
      return { disabled: true, reason: 'Voucher vận chuyển không áp dụng cho nhận tại cửa hàng' }
    }

    if (minOrderValue > 0 && itemsSubtotal < minOrderValue) {
      return {
        disabled: true,
        reason: `Cần tối thiểu ${vnd(minOrderValue)} để áp dụng`,
      }
    }

    return { disabled: false, reason: '' }
  }, [form.isPickup, itemsSubtotal])

  const applyVoucherRequest = useCallback(async ({ orderCode, shippingCode, sourceType }) => {
    if (!user) {
      setAuthModal('login')
      showToast('Vui lòng đăng nhập để áp dụng mã giảm giá', 'error')
      return false
    }

    const nextOrderCode = orderCode?.trim() || null
    const nextShippingCode = shippingCode?.trim() || null

    if (sourceType === 'order' && !nextOrderCode) {
      setVoucherFieldErrors((prev) => ({ ...prev, order: 'Vui lòng nhập mã giảm giá đơn hàng' }))
      return false
    }

    if (sourceType === 'shipping' && !nextShippingCode) {
      setVoucherFieldErrors((prev) => ({ ...prev, shipping: 'Vui lòng nhập mã giảm giá vận chuyển' }))
      return false
    }

    setVoucherLoading((prev) => ({ ...prev, [sourceType]: true }))
    setVoucherFieldErrors((prev) => ({ ...prev, [sourceType]: '' }))
    setVoucherFieldSuccess((prev) => ({ ...prev, [sourceType]: '' }))

    try {
      const res = await fetch(`${API_BASE}/api/vouchers/apply`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          userId: user.id,
          itemsSubtotal,
          shippingFee,
          voucherCode: null,
          orderVoucherCode: nextOrderCode,
          shippingVoucherCode: nextShippingCode,
          salesChannelId: SALES_CHANNEL_ID,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        const fallbackMessage = sourceType === 'order'
          ? 'Mã đơn hàng không hợp lệ hoặc chưa đủ điều kiện'
          : 'Mã vận chuyển không hợp lệ hoặc chưa đủ điều kiện'

        setVoucherFieldErrors((prev) => ({ ...prev, [sourceType]: data.message || fallbackMessage }))
        showToast(data.message || 'Không thể áp dụng voucher', 'error')
        return false
      }

      setVoucherQuote(data)
      setVoucherForm({
        orderVoucherCode: nextOrderCode || '',
        shippingVoucherCode: nextShippingCode || '',
      })
      setVoucherFieldSuccess((prev) => ({
        ...prev,
        [sourceType]: sourceType === 'order' ? 'Áp dụng voucher đơn hàng thành công' : 'Áp dụng voucher vận chuyển thành công',
      }))
      showToast('Áp dụng mã giảm giá thành công', 'success')
      return true
    } catch {
      setVoucherFieldErrors((prev) => ({ ...prev, [sourceType]: 'Không thể kiểm tra mã giảm giá lúc này' }))
      showToast('Không thể kiểm tra mã giảm giá lúc này', 'error')
      return false
    } finally {
      setVoucherLoading((prev) => ({ ...prev, [sourceType]: false }))
    }
  }, [getAuthHeaders, itemsSubtotal, setAuthModal, shippingFee, showToast, user])

  const applyOrderVoucher = useCallback(async () => {
    await applyVoucherRequest({
      orderCode: voucherForm.orderVoucherCode,
      shippingCode: voucherForm.shippingVoucherCode,
      sourceType: 'order',
    })
  }, [applyVoucherRequest, voucherForm.orderVoucherCode, voucherForm.shippingVoucherCode])

  const applyShippingVoucher = useCallback(async () => {
    await applyVoucherRequest({
      orderCode: voucherForm.orderVoucherCode,
      shippingCode: voucherForm.shippingVoucherCode,
      sourceType: 'shipping',
    })
  }, [applyVoucherRequest, voucherForm.orderVoucherCode, voucherForm.shippingVoucherCode])

  const removeOrderVoucher = useCallback(async () => {
    const removed = await applyVoucherRequest({
      orderCode: null,
      shippingCode: voucherForm.shippingVoucherCode,
      sourceType: 'order',
    })
    if (removed) {
      setVoucherForm((prev) => ({ ...prev, orderVoucherCode: '' }))
      setVoucherFieldSuccess((prev) => ({ ...prev, order: 'Đã gỡ voucher đơn hàng' }))
    }
  }, [applyVoucherRequest, voucherForm.shippingVoucherCode])

  const removeShippingVoucher = useCallback(async () => {
    const removed = await applyVoucherRequest({
      orderCode: voucherForm.orderVoucherCode,
      shippingCode: null,
      sourceType: 'shipping',
    })
    if (removed) {
      setVoucherForm((prev) => ({ ...prev, shippingVoucherCode: '' }))
      setVoucherFieldSuccess((prev) => ({ ...prev, shipping: 'Đã gỡ voucher vận chuyển' }))
    }
  }, [applyVoucherRequest, voucherForm.orderVoucherCode])

  const handleSelectVoucherCard = useCallback(async (voucher) => {
    const voucherType = normalizeVoucherType(voucher.voucherType)
    const evaluation = evaluateVoucherAvailability(voucher)
    if (evaluation.disabled) {
      return
    }

    if (voucherType === 'Shipping') {
      const selectedCode = voucher.code || ''
      setVoucherForm((prev) => ({ ...prev, shippingVoucherCode: selectedCode }))
      await applyVoucherRequest({
        orderCode: voucherForm.orderVoucherCode,
        shippingCode: selectedCode,
        sourceType: 'shipping',
      })
      return
    }

    const selectedCode = voucher.code || ''
    setVoucherForm((prev) => ({ ...prev, orderVoucherCode: selectedCode }))
    await applyVoucherRequest({
      orderCode: selectedCode,
      shippingCode: voucherForm.shippingVoucherCode,
      sourceType: 'order',
    })
  }, [applyVoucherRequest, evaluateVoucherAvailability, voucherForm.orderVoucherCode, voucherForm.shippingVoucherCode])

  const appliedOrderVoucher = useMemo(() => {
    return voucherQuote?.appliedVouchers?.find((voucher) => normalizeVoucherType(voucher.voucherType) === 'Order') || null
  }, [voucherQuote])

  const appliedShippingVoucher = useMemo(() => {
    return voucherQuote?.appliedVouchers?.find((voucher) => normalizeVoucherType(voucher.voucherType) === 'Shipping') || null
  }, [voucherQuote])

  useEffect(() => {
    if (pendingCheckoutAfterLogin && user && !isLoading) {
      setPendingCheckoutAfterLogin(false)
      void executeCheckoutByMethod()
    }
  }, [executeCheckoutByMethod, pendingCheckoutAfterLogin, user, isLoading])

  useEffect(() => {
    if (form.paymentMethod !== 'BankTransfer' || !bankPayment?.paymentCode || bankCheckoutCompleted) {
      return undefined
    }

    bankPollingRef.current = setInterval(() => {
      void checkBankTransferStatus(bankPayment.paymentCode)
    }, 5000)

    return () => {
      if (bankPollingRef.current) {
        clearInterval(bankPollingRef.current)
        bankPollingRef.current = null
      }
    }
  }, [bankCheckoutCompleted, bankPayment?.paymentCode, checkBankTransferStatus, form.paymentMethod])

  const handleCheckout = async (e) => {
    e.preventDefault()

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      showToast('Vui lòng kiểm tra các lỗi nhập liệu', 'error')
      return
    }

    if (!user) {
      setPendingCheckoutAfterLogin(true)
      showToast('Vui lòng đăng nhập để thanh toán', 'error')
      setAuthModal('login')
      return
    }

    await executeCheckoutByMethod()
  }

  const applyFieldError = (key) => (errors[key] ? 'checkout-input checkout-input-error' : 'checkout-input')

  if (cart.length === 0) {
    return (
      <div className="checkout-page checkout-page-empty">
        <div className="checkout-empty-card">
          <p className="checkout-kicker">Thanh toán</p>
          <h1>Giỏ hàng của bạn đang trống</h1>
          <p>Chọn sản phẩm trước, sau đó quay lại đây để hoàn tất thanh toán trong vài bước ngắn.</p>
          <button className="btn-gold" onClick={() => navigate('/')}>Tiếp tục mua sắm</button>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="checkout-shell container">
        <header className="checkout-hero">
          <div>
            <p className="checkout-kicker">Thanh toán</p>
            <h1 className="brand-font checkout-title">Thanh Toán</h1>
            <p className="checkout-subtitle">Kiểm tra thông tin, áp dụng mã giảm giá và hoàn tất đơn trong một luồng rõ ràng.</p>
          </div>
          <div className="checkout-stats">
            <div className="checkout-stat">
              <span>Tổng món</span>
              <strong>{cart.reduce((sum, item) => sum + item.quantity, 0)}</strong>
            </div>
            <div className="checkout-stat">
              <span>Tạm tính</span>
              <strong>{vnd(itemsSubtotal)}</strong>
            </div>
          </div>
        </header>

        <div className="checkout-layout">
          <section className="checkout-form-panel checkout-card">
            <div className="checkout-section-head">
              <div>
                <p className="checkout-section-label">Bước 1</p>
                <h2>Thông tin giao hàng</h2>
              </div>
              <span className="checkout-section-note">Các trường có lỗi sẽ được tô nổi bật.</span>
            </div>

            <form onSubmit={handleCheckout} className="checkout-form">
              <div className="checkout-field-grid">
                <div className="form-group">
                  <label htmlFor="fullName">Họ tên người nhận</label>
                  <input
                    id="fullName"
                    required
                    type="text"
                    value={form.fullName}
                    onChange={(e) => {
                      setForm({ ...form, fullName: e.target.value })
                      setErrors({ ...errors, fullName: '' })
                    }}
                    className={applyFieldError('fullName')}
                    placeholder="Nhập họ tên"
                  />
                  {errors.fullName && <div className="checkout-error">{errors.fullName}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Số điện thoại</label>
                  <input
                    id="phone"
                    required
                    type="text"
                    value={form.phone}
                    onChange={(e) => {
                      setForm({ ...form, phone: e.target.value })
                      setErrors({ ...errors, phone: '' })
                    }}
                    className={applyFieldError('phone')}
                    placeholder="Ví dụ: 0912345678"
                  />
                  {errors.phone && <div className="checkout-error">{errors.phone}</div>}
                </div>
              </div>

              <div className="checkout-choice-group">
                <label className={`checkout-choice ${form.isPickup ? 'active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.isPickup}
                    onChange={(e) => setForm({ ...form, isPickup: e.target.checked })}
                  />
                  <div>
                    <strong>Nhận hàng tại cửa hàng</strong>
                    <span>Phù hợp khi bạn muốn ghé lấy nhanh và không cần phí giao.</span>
                  </div>
                </label>

                {!form.isPickup && (
                  <div className="form-group checkout-address">
                    <label htmlFor="address">Địa chỉ giao hàng chi tiết</label>
                    <input
                      id="address"
                      required
                      type="text"
                      value={form.address}
                      onChange={(e) => {
                        setForm({ ...form, address: e.target.value })
                        setErrors({ ...errors, address: '' })
                      }}
                      className={applyFieldError('address')}
                      placeholder="Số nhà, đường, phường/xã, quận/huyện"
                    />
                    {errors.address && <div className="checkout-error">{errors.address}</div>}
                  </div>
                )}
              </div>

              <div className="checkout-payment-panel">
                <div className="checkout-section-head compact">
                  <div>
                    <p className="checkout-section-label">Bước 2</p>
                    <h2>Hình thức thanh toán</h2>
                  </div>
                </div>

                <div className="checkout-payment-options">
                  <label className={`checkout-payment-option ${form.paymentMethod === 'Cash' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash"
                      checked={form.paymentMethod === 'Cash'}
                      onChange={(e) => {
                        setForm({ ...form, paymentMethod: e.target.value })
                        setErrors({ ...errors, paymentMethod: '' })
                      }}
                    />
                    <div>
                      <strong>Tiền mặt khi nhận hàng</strong>
                      <span>Chọn khi bạn muốn thanh toán sau khi nhận sản phẩm.</span>
                    </div>
                  </label>

                  <label className={`checkout-payment-option ${form.paymentMethod === 'BankTransfer' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BankTransfer"
                      checked={form.paymentMethod === 'BankTransfer'}
                      onChange={(e) => {
                        setForm({ ...form, paymentMethod: e.target.value })
                        setErrors({ ...errors, paymentMethod: '' })
                      }}
                    />
                    <div>
                      <strong>Chuyển khoản ngân hàng</strong>
                      <span>Hiển thị QR và mã tham chiếu ngay bên dưới.</span>
                    </div>
                  </label>
                </div>

                {errors.paymentMethod && <div className="checkout-error">{errors.paymentMethod}</div>}

                {form.paymentMethod === 'BankTransfer' && (
                  <div className="checkout-transfer-card">
                    <div className="checkout-transfer-copy">
                      <p className="checkout-section-label">Thông tin chuyển khoản</p>
                      {!bankPayment && (
                        <p className="checkout-voucher-helper">Nhấn "Tạo yêu cầu chuyển khoản" để sinh mã thanh toán và QR riêng cho đơn hàng của bạn.</p>
                      )}
                      {bankPayment && <h3>{bankPayment.bankName}</h3>}
                      <div className="checkout-transfer-grid">
                        <div>
                          <span>Số tài khoản</span>
                          <strong>{bankPayment?.accountNo || '--'}</strong>
                        </div>
                        <div>
                          <span>Chủ tài khoản</span>
                          <strong>{bankPayment?.accountName || '--'}</strong>
                        </div>
                        <div>
                          <span>Mã thanh toán</span>
                          <strong>{bankPayment?.paymentCode || '--'}</strong>
                        </div>
                        <div>
                          <span>Số tiền</span>
                          <strong>{new Intl.NumberFormat('vi-VN').format(transferAmount)} VND</strong>
                        </div>
                      </div>

                      {bankPayment && (
                        <div className="checkout-transfer-confirm">
                          <div className="form-group">
                            <label htmlFor="transferContent">Nội dung chuyển khoản</label>
                            <input
                              id="transferContent"
                              type="text"
                              className="checkout-input"
                              value={transferContent}
                              onChange={(e) => setTransferContent(e.target.value)}
                              placeholder={`Thanh toan ${bankPayment.paymentCode}`}
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="externalTransactionId">Mã giao dịch (tuỳ chọn)</label>
                            <input
                              id="externalTransactionId"
                              type="text"
                              className="checkout-input"
                              value={externalTransactionId}
                              onChange={(e) => setExternalTransactionId(e.target.value)}
                              placeholder="Nhập mã giao dịch ngân hàng"
                            />
                          </div>

                          <button
                            type="button"
                            className="cart-secondary-btn checkout-voucher-btn"
                            onClick={verifyBankTransfer}
                            disabled={isVerifyingBankPayment || isConfirmingBankOrder || bankCheckoutCompleted}
                          >
                            {isVerifyingBankPayment ? 'Đang xác minh...' : 'Tôi đã chuyển khoản, xác minh ngay'}
                          </button>

                          {bankStatus && <p className="checkout-voucher-helper">Trạng thái: {bankStatus.message || bankStatus.paymentStatus}</p>}
                        </div>
                      )}
                    </div>
                    <div className="checkout-qr-wrap">
                      {bankPayment?.qrUrl ? (
                        <img src={bankPayment.qrUrl} alt="QR chuyển khoản" className="checkout-qr" />
                      ) : (
                        <p className="checkout-voucher-helper">QR sẽ hiển thị sau khi tạo yêu cầu chuyển khoản.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="checkout-voucher-panel">
                <div className="checkout-section-head compact">
                  <div>
                    <p className="checkout-section-label">Bước 3</p>
                    <h2>Mã giảm giá</h2>
                  </div>
                </div>

                <div className="checkout-voucher-sections">
                  <div className="checkout-voucher-block">
                    <p className="checkout-voucher-block-label">Voucher đơn hàng</p>
                    <div className="checkout-voucher-input-row">
                      <input
                        id="orderVoucherCode"
                        type="text"
                        spellCheck={false}
                        autoCorrect="off"
                        autoCapitalize="none"
                        className={`checkout-input ${voucherFieldErrors.order ? 'checkout-input-error' : ''}`}
                        value={voucherForm.orderVoucherCode}
                        onChange={(e) => {
                          setVoucherForm((prev) => ({ ...prev, orderVoucherCode: e.target.value }))
                          setVoucherFieldErrors((prev) => ({ ...prev, order: '' }))
                          setVoucherFieldSuccess((prev) => ({ ...prev, order: '' }))
                        }}
                        placeholder="Nhập mã giảm giá đơn hàng"
                      />
                      <button
                        type="button"
                        className="cart-secondary-btn checkout-voucher-apply-btn"
                        onClick={applyOrderVoucher}
                        disabled={voucherLoading.order}
                      >
                        {voucherLoading.order ? 'Đang áp dụng...' : 'Áp dụng'}
                      </button>
                    </div>
                    {voucherFieldErrors.order && <div className="checkout-error checkout-voucher-error">{voucherFieldErrors.order}</div>}
                    {!voucherFieldErrors.order && voucherFieldSuccess.order && (
                      <div className="checkout-voucher-success">{voucherFieldSuccess.order}</div>
                    )}

                    {appliedOrderVoucher && Number(voucherQuote?.orderVoucherDiscount || 0) > 0 && (
                      <div className="checkout-voucher-applied-row">
                        <span>Đã áp dụng: <strong>{appliedOrderVoucher.code || voucherForm.orderVoucherCode}</strong></span>
                        <span className="checkout-voucher-discount">-{vnd(voucherQuote.orderVoucherDiscount)}</span>
                        <button type="button" className="checkout-voucher-remove-btn" onClick={removeOrderVoucher}>Gỡ</button>
                      </div>
                    )}
                  </div>

                  <div className="checkout-voucher-block">
                    <p className="checkout-voucher-block-label">Voucher vận chuyển</p>
                    <div className="checkout-voucher-input-row">
                      <input
                        id="shippingVoucherCode"
                        type="text"
                        spellCheck={false}
                        autoCorrect="off"
                        autoCapitalize="none"
                        className={`checkout-input ${voucherFieldErrors.shipping ? 'checkout-input-error' : ''}`}
                        value={voucherForm.shippingVoucherCode}
                        onChange={(e) => {
                          setVoucherForm((prev) => ({ ...prev, shippingVoucherCode: e.target.value }))
                          setVoucherFieldErrors((prev) => ({ ...prev, shipping: '' }))
                          setVoucherFieldSuccess((prev) => ({ ...prev, shipping: '' }))
                        }}
                        placeholder="Nhập mã giảm giá vận chuyển"
                      />
                      <button
                        type="button"
                        className="cart-secondary-btn checkout-voucher-apply-btn"
                        onClick={applyShippingVoucher}
                        disabled={voucherLoading.shipping}
                      >
                        {voucherLoading.shipping ? 'Đang áp dụng...' : 'Áp dụng'}
                      </button>
                    </div>
                    {voucherFieldErrors.shipping && <div className="checkout-error checkout-voucher-error">{voucherFieldErrors.shipping}</div>}
                    {!voucherFieldErrors.shipping && voucherFieldSuccess.shipping && (
                      <div className="checkout-voucher-success">{voucherFieldSuccess.shipping}</div>
                    )}

                    {appliedShippingVoucher && Number(voucherQuote?.shippingVoucherDiscount || 0) > 0 && (
                      <div className="checkout-voucher-applied-row">
                        <span>Đã áp dụng: <strong>{appliedShippingVoucher.code || voucherForm.shippingVoucherCode}</strong></span>
                        <span className="checkout-voucher-discount">-{vnd(voucherQuote.shippingVoucherDiscount)}</span>
                        <button type="button" className="checkout-voucher-remove-btn" onClick={removeShippingVoucher}>Gỡ</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="checkout-voucher-list">
                  <p className="checkout-voucher-list-title">Voucher có thể dùng</p>
                  <p className="checkout-voucher-helper">Có thể dùng 1 voucher đơn hàng và 1 voucher vận chuyển nếu đều hợp lệ.</p>

                  {isLoadingVoucherList ? (
                    <p className="checkout-voucher-helper">Đang tải danh sách mã...</p>
                  ) : availableVouchers.length === 0 ? (
                    <p className="checkout-voucher-helper">Hiện chưa có voucher khả dụng.</p>
                  ) : (
                    <div className="checkout-voucher-list-grid">
                      {availableVouchers.map((voucher) => {
                        const voucherType = normalizeVoucherType(voucher.voucherType)
                        const evaluation = evaluateVoucherAvailability(voucher)
                        const discountText = voucher.discountType === 'Percentage'
                          ? `${voucher.discountValue}%${voucher.maxDiscountAmount ? ` (tối đa ${vnd(voucher.maxDiscountAmount)})` : ''}`
                          : vnd(voucher.discountValue)

                        return (
                          <div
                            key={voucher.code}
                            className={`checkout-voucher-item ${evaluation.disabled ? 'is-disabled' : ''}`}
                          >
                            <div className="checkout-voucher-item-top">
                              <span className={`checkout-voucher-badge ${voucherType === 'Shipping' ? 'shipping' : 'order'}`}>
                                {voucherType === 'Shipping' ? 'Vận chuyển' : 'Đơn hàng'}
                              </span>
                              <strong>{voucher.code}</strong>
                            </div>
                            <p className="checkout-voucher-item-name">{voucher.name}</p>
                            <p className="checkout-voucher-item-meta">
                              Giảm: {discountText}
                              {voucher.minOrderValue ? ` · Tối thiểu ${vnd(voucher.minOrderValue)}` : ''}
                            </p>
                            {evaluation.disabled && <p className="checkout-voucher-item-disabled-msg">{evaluation.reason}</p>}
                            <button
                              type="button"
                              className="cart-secondary-btn checkout-voucher-select-btn"
                              disabled={evaluation.disabled || voucherLoading.order || voucherLoading.shipping}
                              onClick={() => {
                                void handleSelectVoucherCard(voucher)
                              }}
                            >
                              {evaluation.disabled ? 'Không thể chọn' : 'Chọn'}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {voucherQuote && (
                  <div className="checkout-voucher-breakdown">
                    <div className="checkout-breakdown-row">
                      <span>Tạm tính sản phẩm</span>
                      <strong>{vnd(voucherQuote.itemsSubtotal)}</strong>
                    </div>
                    <div className="checkout-breakdown-row">
                      <span>Phí vận chuyển</span>
                      <strong>{vnd(voucherQuote.shippingFee)}</strong>
                    </div>
                    <div className="checkout-breakdown-row discount">
                      <span>Giảm giá đơn hàng</span>
                      <strong>-{vnd(voucherQuote.orderVoucherDiscount)}</strong>
                    </div>
                    <div className="checkout-breakdown-row discount">
                      <span>Giảm giá vận chuyển</span>
                      <strong>-{vnd(voucherQuote.shippingVoucherDiscount)}</strong>
                    </div>
                    <div className="checkout-breakdown-total">
                      <span>Tổng thanh toán</span>
                      <strong>{vnd(voucherQuote.finalTotal)}</strong>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn-gold checkout-submit"
                disabled={isLoading || isCreatingBankRequest || (form.paymentMethod === 'BankTransfer' && !!bankPayment)}
              >
                {isLoading || isCreatingBankRequest
                  ? 'Đang xử lý...'
                  : form.paymentMethod === 'BankTransfer'
                    ? (bankPayment ? 'Đang chờ thanh toán chuyển khoản' : 'Tạo yêu cầu chuyển khoản')
                    : 'Xác nhận đặt hàng'}
              </button>
            </form>
          </section>

          <aside className="checkout-summary-panel checkout-card">
            <div className="checkout-section-head compact">
              <div>
                <p className="checkout-section-label">Bước 4</p>
                <h2>Tóm tắt đơn hàng</h2>
              </div>
            </div>

            <div className="checkout-summary-list">
              {cart.map((item) => (
                <div key={item.id} className="checkout-summary-item">
                  <div className="checkout-summary-thumb">
                    <img src={item.imageUrl} alt={item.name} />
                  </div>
                  <div className="checkout-summary-copy">
                    <h3>{item.name}</h3>
                    {item.engraving && <p className="checkout-summary-meta">Khắc tên: {item.engraving}</p>}
                    <p className="checkout-summary-meta">Số lượng: {item.quantity}</p>
                  </div>
                  <div className="checkout-summary-price">{vnd(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>

            <div className="checkout-total-box">
              <div className="checkout-total-line">
                <span>Tạm tính sản phẩm</span>
                <strong>{vnd(itemsSubtotal)}</strong>
              </div>
              <div className="checkout-total-line">
                <span>Phí vận chuyển</span>
                <strong>{vnd(shippingFee)}</strong>
              </div>
              <div className="checkout-total-line discount">
                <span>Voucher đơn hàng</span>
                <strong>-{vnd(voucherQuote?.orderVoucherDiscount || 0)}</strong>
              </div>
              <div className="checkout-total-line discount">
                <span>Voucher vận chuyển</span>
                <strong>-{vnd(voucherQuote?.shippingVoucherDiscount || 0)}</strong>
              </div>
              <div className="checkout-total-line final">
                <span>Tổng cộng</span>
                <strong>{vnd(finalTotal)}</strong>
              </div>
              {form.paymentMethod === 'BankTransfer' && (
                <div className="checkout-total-line">
                  <span>Số tiền chuyển khoản bắt buộc</span>
                  <strong>{new Intl.NumberFormat('vi-VN').format(transferAmount)} VND</strong>
                </div>
              )}
              <p>Giá hiển thị trực tiếp theo VND.</p>
              {cartNote && <p>Ghi chú giỏ hàng: {cartNote}</p>}
              {voucherQuote?.appliedVouchers?.length > 0 && (
                <p>Mã áp dụng: {voucherQuote.appliedVouchers.map((voucher) => voucher.code).join(', ')}</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
