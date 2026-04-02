import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const CheckoutPage = () => {
  const navigate = useNavigate()
  const cart = useAppStore(state => state.cart)
  const clearCart = useAppStore(state => state.clearCart)
  const user = useAppStore(state => state.user)
  const showToast = useAppStore(state => state.showToast)
  const setAuthModal = useAppStore(state => state.setAuthModal)

  const [form, setForm] = useState({ fullName: '', address: '', phone: '', isPickup: false })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [pendingCheckoutAfterLogin, setPendingCheckoutAfterLogin] = useState(false)
  const vnd = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price * 24000)
  
  const validateForm = () => {
    const newErrors = {}
    if (!form.fullName.trim()) newErrors.fullName = 'Họ tên không được để trống'
    if (!form.phone.trim()) newErrors.phone = 'Số điện thoại không được để trống'
    
    // Normalize and validate phone
    const phoneNormalized = form.phone.replace(/[\s+-]/g, '')
    if (form.phone.trim() && !/^(0[3-9])[0-9]{8}$/.test(phoneNormalized)) {
      newErrors.phone = 'Số điện thoại phải là 10 chữ số và bắt đầu bằng 03, 04, 05, 07, 08 hoặc 09'
    }
    if (!form.isPickup && !form.address.trim()) newErrors.address = 'Địa chỉ giao hàng không được để trống'
    return newErrors
  }
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  const submitOrder = async () => {
    if (cart.length === 0) { showToast('Giỏ hàng trống', 'error'); return }

    setIsLoading(true)
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (user?.role) headers['X-User-Role'] = user.role;
      if (user?.accessToken) headers['Authorization'] = `Bearer ${user.accessToken}`;

      const res = await fetch(`${API_BASE}/api/orders/batch`, {
        method: 'POST', headers,
        body: JSON.stringify({
          userId: user.id,
          items: cart.map(item => ({ perfumeId: item.id, quantity: item.quantity })),
          shippingAddress: form.isPickup ? 'NHẬN TẠI CỬA HÀNG' : form.address,
          receiverPhone: form.phone,
          note: `[${form.isPickup ? 'PICKUP' : 'DELIVERY'}] Người nhận: ${form.fullName}`,
          isPickup: form.isPickup
        })
      })
      
      const data = await res.json()
      if (res.ok) {
        clearCart()
        showToast('🎉 Đặt hàng thành công! Cảm ơn bạn.')
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

  useEffect(() => {
    if (pendingCheckoutAfterLogin && user && !isLoading) {
      setPendingCheckoutAfterLogin(false)
      void submitOrder()
    }
  }, [pendingCheckoutAfterLogin, user, isLoading])

  const handleCheckout = async (e) => {
    e.preventDefault()

    // Validate form first so user can fix inputs before login
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

  if (cart.length === 0) {
    return <div className="container" style={{ paddingTop: '100px', textAlign: 'center', minHeight: '60vh' }}>
      <h2>Giỏ hàng của bạn đang trống</h2>
      <button className="btn-gold" style={{ marginTop: '2rem' }} onClick={() => navigate('/')}>Tiếp tục mua sắm</button>
    </div>
  }

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
      <h1 className="brand-font" style={{ textAlign: 'center', marginBottom: '3rem' }}>Thanh Toán</h1>
      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
        {/* Form */}
        <div style={{ flex: '1 1 500px' }}>
          <form onSubmit={handleCheckout} style={{ background: '#111', padding: '2rem', borderRadius: '12px' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-gold)' }}>Thông tin giao hàng</h3>
            <div className="form-group">
              <label>Họ tên người nhận</label>
              <input required type="text" value={form.fullName} onChange={e => { setForm({...form, fullName: e.target.value}); setErrors({...errors, fullName: ''}) }} style={{ borderColor: errors.fullName ? '#ef4444' : undefined }} />
              {errors.fullName && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.fullName}</div>}
            </div>
            <div className="form-group">
              <label>Số điện thoại (10 chữ số)</label>
              <input required type="text" value={form.phone} onChange={e => { setForm({...form, phone: e.target.value}); setErrors({...errors, phone: ''}) }} style={{ borderColor: errors.phone ? '#ef4444' : undefined }} />
              {errors.phone && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.phone}</div>}
            </div>
            
            <label className="checkbox-label" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={form.isPickup} onChange={e => setForm({...form, isPickup: e.target.checked})} />
              <span>Nhận hàng tại cửa hàng trực tiếp</span>
            </label>

            {!form.isPickup && (
              <div className="form-group">
                <label>Địa chỉ giao hàng chi tiết</label>
                <input required type="text" value={form.address} onChange={e => { setForm({...form, address: e.target.value}); setErrors({...errors, address: ''}) }} style={{ borderColor: errors.address ? '#ef4444' : undefined }} />
                {errors.address && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.address}</div>}
              </div>
            )}
            
            <button type="submit" className="btn-gold" style={{ width: '100%', marginTop: '2rem', opacity: isLoading ? 0.6 : 1 }} disabled={isLoading}>
              {isLoading ? '⏳ Đang xử lý...' : 'Xác Nhận Đặt Hàng'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div style={{ flex: '1 1 300px', background: '#0a0a0a', border: '1px solid #333', padding: '2rem', borderRadius: '12px', height: 'max-content' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>Tóm Tắt Đơn Hàng</h3>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
              <span>{item.quantity} x {item.name}</span>
              <span>{vnd(item.price * item.quantity)}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #333', marginTop: '1.5rem', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
            <span>Tổng cộng:</span>
            <span>{vnd(cartTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage

