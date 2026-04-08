import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

const CartPage = () => {
  const navigate = useNavigate()
  const cart = useAppStore((state) => state.cart)
  const cartNote = useAppStore((state) => state.cartNote)
  const setCartNote = useAppStore((state) => state.setCartNote)
  const updateCartQty = useAppStore((state) => state.updateCartQty)
  const setCartItemQty = useAppStore((state) => state.setCartItemQty)
  const removeFromCart = useAppStore((state) => state.removeFromCart)
  const clearCart = useAppStore((state) => state.clearCart)

  const vnd = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  )

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  if (cart.length === 0) {
    return (
      <section className="cart-page">
        <div className="container">
          <div className="checkout-empty-card cart-empty-page">
            <p className="checkout-kicker">Giỏ hàng</p>
            <h1>Giỏ hàng đang trống</h1>
            <p>Chưa có sản phẩm nào trong giỏ. Hãy chọn một mùi hương yêu thích để bắt đầu tạo đơn.</p>
            <div className="cart-empty-actions">
              <button className="btn-gold" onClick={() => navigate('/')}>Tiếp tục mua sắm</button>
              <button className="cart-secondary-btn" onClick={() => navigate('/checkout')}>Đi tới thanh toán</button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="cart-page">
      <div className="container">
        <header className="checkout-hero cart-page-hero">
          <div>
            <p className="checkout-kicker">Giỏ hàng</p>
            <h1 className="brand-font checkout-title">Giỏ hàng của bạn</h1>
            <p className="checkout-subtitle">Xem lại số lượng, ghi chú đơn và đi tiếp sang thanh toán khi đã sẵn sàng.</p>
          </div>
          <div className="checkout-stats">
            <div className="checkout-stat">
              <span>Sản phẩm</span>
              <strong>{cart.length}</strong>
            </div>
            <div className="checkout-stat">
              <span>Tổng món</span>
              <strong>{cartCount}</strong>
            </div>
          </div>
        </header>

        <div className="cart-page-layout">
          <article className="cart-page-items cart-page-panel">
            <div className="cart-page-panel-head">
              <div>
                <p className="checkout-section-label">Danh sách sản phẩm</p>
                <h2>Món đang chờ thanh toán</h2>
              </div>
              <button className="cart-text-action" type="button" onClick={() => clearCart()}>
                Xóa toàn bộ
              </button>
            </div>

            <div className="cart-page-list">
              {cart.map((item) => (
                <div key={item.id} className="cart-page-item">
                  <img src={item.imageUrl} alt={item.name} />
                  <div className="cart-item-details">
                    <div className="cart-page-item-head">
                      <div>
                        <h3 className="cart-item-title">{item.name}</h3>
                        {item.engraving && <p className="cart-item-note">Khắc tên: {item.engraving}</p>}
                      </div>
                      <p className="cart-item-price">{vnd(item.price * item.quantity)}</p>
                    </div>
                    <div className="qty-controls">
                      <button
                        className="qty-btn-sm"
                        type="button"
                        aria-label={`Giảm số lượng ${item.name}`}
                        disabled={item.quantity <= 1}
                        onClick={() => updateCartQty(item.id, -1)}
                      >
                        -
                      </button>
                      <input
                        className="cart-qty-value cart-qty-input"
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => setCartItemQty(item.id, e.target.value)}
                        aria-label={`Số lượng ${item.name}`}
                      />
                      <button className="qty-btn-sm" type="button" aria-label={`Tăng số lượng ${item.name}`} onClick={() => updateCartQty(item.id, 1)}>+</button>
                      <button className="btn-remove" type="button" onClick={() => removeFromCart(item.id)}>
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <aside className="cart-summary-box cart-page-panel">
            <div className="cart-summary-head">
              <p className="checkout-section-label">Tóm tắt</p>
              <h2>Tổng kết đơn hàng</h2>
            </div>

            <div className="cart-summary-card">
              <div className="summary-row">
                <span>Số lượng món</span>
                <strong>{cartCount}</strong>
              </div>
              <div className="summary-row">
                <span>Tạm tính</span>
                <strong>{vnd(cartTotal)}</strong>
              </div>
              <div className="summary-row">
                <span>Ghi chú đơn</span>
              </div>
              <textarea
                className="form-input cart-summary-note"
                value={cartNote}
                onChange={(e) => setCartNote(e.target.value)}
                placeholder="Ví dụ: giao giờ hành chính, bọc quà, hoặc nhắn trước khi giao"
              />
              <div className="summary-total">
                <span>Tổng cộng</span>
                <strong>{vnd(cartTotal)}</strong>
              </div>
              <div className="cart-summary-actions">
                <button className="btn-gold" type="button" onClick={() => navigate('/checkout')}>
                  Tiến hành thanh toán
                </button>
                <button className="cart-secondary-btn" type="button" onClick={() => navigate('/')}>
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default CartPage
