import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
const DEFAULT_SHIPPING_FEE = 2.08
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
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false)
  const [pendingCheckoutAfterLogin, setPendingCheckoutAfterLogin] = useState(false)
  const [voucherForm, setVoucherForm] = useState({ orderVoucherCode: '', shippingVoucherCode: '' })
  const [voucherQuote, setVoucherQuote] = useState(null)
  const [voucherMessage, setVoucherMessage] = useState('')
  const [voucherError, setVoucherError] = useState('')

  const vnd = (baseAmount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(baseAmount * 24000)
  const itemsSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingFee = form.isPickup ? 0 : DEFAULT_SHIPPING_FEE
  const finalTotal = voucherQuote?.finalTotal ?? Math.max(0, itemsSubtotal + shippingFee)
  const transferAmount = Math.round(finalTotal * 24000)

  const transferRef = useMemo(() => {
    const userPart = user?.id ? `U${user.id}` : 'GUEST'
    return `KP-${userPart}-${transferAmount}`
  }, [transferAmount, user?.id])

  const transferQrUrl = useMemo(() => {
    const bank = '970436'
    const accountNo = '190012345678'
    const accountName = encodeURIComponent('CONG TY KP LUXURY')
    const addInfo = encodeURIComponent(`Thanh toan ${transferRef}`)
    return `https://img.vietqr.io/image/${bank}-${accountNo}-compact2.png?amount=${transferAmount}&addInfo=${addInfo}&accountName=${accountName}`
  }, [transferAmount, transferRef])

  useEffect(() => {
    setVoucherQuote(null)
    setVoucherMessage('')
    setVoucherError('')
  }, [form.isPickup, voucherForm.orderVoucherCode, voucherForm.shippingVoucherCode, itemsSubtotal])

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

  const submitOrder = async () => {
    if (cart.length === 0) {
      showToast('Giỏ hàng trống', 'error')
      return
    }

    setIsLoading(true)
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (user?.role) headers['X-User-Role'] = user.role
      if (user?.accessToken) headers['Authorization'] = `Bearer ${user.accessToken}`

      const res = await fetch(`${API_BASE}/api/orders/batch`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: user.id,
          items: cart.map((item) => ({ perfumeId: item.id, quantity: item.quantity })),
          shippingAddress: form.isPickup ? 'NHẬN TẠI CỬA HÀNG' : form.address,
          receiverPhone: form.phone,
          shippingFee,
          voucherCode: voucherForm.orderVoucherCode || voucherForm.shippingVoucherCode || null,
          orderVoucherCode: voucherForm.orderVoucherCode || null,
          shippingVoucherCode: voucherForm.shippingVoucherCode || null,
          salesChannelId: SALES_CHANNEL_ID,
          note: `[${form.isPickup ? 'PICKUP' : 'DELIVERY'}] Người nhận: ${form.fullName}${cartNote ? ` | Ghi chú: ${cartNote}` : ''}${form.paymentMethod === 'BankTransfer' ? ` [TRANSFER_REF:${transferRef}]` : ''}`,
          isPickup: form.isPickup,
          paymentMethod: form.paymentMethod,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        clearCart()
        if (form.paymentMethod === 'BankTransfer') {
          showToast('Đặt hàng thành công. Vui lòng chuyển khoản để xác nhận đơn.', 'success')
        } else {
          showToast('Đặt hàng thành công! Cảm ơn bạn.', 'success')
        }
        navigate('/profile')
      } else {
        showToast(data.message || 'Lỗi đặt hàng', 'error')
      }
    } catch {
      showToast('Lỗi kết nối khi đặt hàng', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const applyVoucher = async () => {
    if (!user) {
      setAuthModal('login')
      showToast('Vui lòng đăng nhập để áp dụng mã giảm giá', 'error')
      return
    }

    if (!voucherForm.orderVoucherCode.trim() && !voucherForm.shippingVoucherCode.trim()) {
      setVoucherError('Vui lòng nhập ít nhất một mã giảm giá')
      showToast('Vui lòng nhập ít nhất một mã giảm giá', 'error')
      return
    }

    setIsApplyingVoucher(true)
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (user?.role) headers['X-User-Role'] = user.role
      if (user?.accessToken) headers['Authorization'] = `Bearer ${user.accessToken}`

      const res = await fetch(`${API_BASE}/api/vouchers/apply`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: user.id,
          itemsSubtotal,
          shippingFee,
          voucherCode: null,
          orderVoucherCode: voucherForm.orderVoucherCode.trim() || null,
          shippingVoucherCode: voucherForm.shippingVoucherCode.trim() || null,
          salesChannelId: SALES_CHANNEL_ID,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setVoucherQuote(null)
        setVoucherMessage('')
        setVoucherError(data.message || 'Mã giảm giá không hợp lệ')
        showToast(data.message || 'Mã giảm giá không hợp lệ', 'error')
        return
      }

      setVoucherQuote(data)
      setVoucherMessage('Đã áp dụng mã giảm giá thành công')
      setVoucherError('')
      showToast('Áp dụng mã giảm giá thành công', 'success')
    } catch {
      setVoucherQuote(null)
      setVoucherMessage('')
      setVoucherError('Không thể kiểm tra mã giảm giá lúc này')
      showToast('Không thể kiểm tra mã giảm giá lúc này', 'error')
    } finally {
      setIsApplyingVoucher(false)
    }
  }

  useEffect(() => {
    if (pendingCheckoutAfterLogin && user && !isLoading) {
      setPendingCheckoutAfterLogin(false)
      void submitOrder()
    }
  }, [pendingCheckoutAfterLogin, user, isLoading])

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

    await submitOrder()
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
                      <h3>Vietcombank</h3>
                      <div className="checkout-transfer-grid">
                        <div>
                          <span>Số tài khoản</span>
                          <strong>190012345678</strong>
                        </div>
                        <div>
                          <span>Chủ tài khoản</span>
                          <strong>CONG TY KP LUXURY</strong>
                        </div>
                        <div>
                          <span>Nội dung</span>
                          <strong>Thanh toan {transferRef}</strong>
                        </div>
                        <div>
                          <span>Số tiền</span>
                          <strong>{new Intl.NumberFormat('vi-VN').format(transferAmount)} VND</strong>
                        </div>
                      </div>
                    </div>
                    <div className="checkout-qr-wrap">
                      <img src={transferQrUrl} alt="QR chuyển khoản" className="checkout-qr" />
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

                <div className="checkout-voucher-grid">
                  <div className="form-group">
                    <label htmlFor="orderVoucherCode">Mã giảm giá đơn hàng</label>
                    <input
                      id="orderVoucherCode"
                      type="text"
                      className="checkout-input"
                      value={voucherForm.orderVoucherCode}
                      onChange={(e) => setVoucherForm({ ...voucherForm, orderVoucherCode: e.target.value })}
                      placeholder="VD: WELCOME10"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="shippingVoucherCode">Mã giảm giá vận chuyển</label>
                    <input
                      id="shippingVoucherCode"
                      type="text"
                      className="checkout-input"
                      value={voucherForm.shippingVoucherCode}
                      onChange={(e) => setVoucherForm({ ...voucherForm, shippingVoucherCode: e.target.value })}
                      placeholder="VD: SHIP20K"
                    />
                  </div>
                </div>

                <div className="checkout-voucher-actions">
                  <button type="button" className="cart-secondary-btn checkout-voucher-btn" onClick={applyVoucher} disabled={isApplyingVoucher}>
                    {isApplyingVoucher ? 'Đang kiểm tra...' : 'Áp dụng mã giảm giá'}
                  </button>
                  <p className="checkout-voucher-helper">Có thể dùng một mã hoặc kết hợp 1 mã đơn hàng + 1 mã vận chuyển.</p>
                </div>

                {voucherError && <div className="checkout-error checkout-voucher-error">{voucherError}</div>}
                {!voucherError && voucherMessage && <div className="checkout-voucher-success">{voucherMessage}</div>}

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

              <button type="submit" className="btn-gold checkout-submit" disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
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
              <p>Giá hiển thị theo tiền tệ nội bộ, được quy đổi theo tỷ giá 24,000 VND cho mỗi đơn vị.</p>
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
