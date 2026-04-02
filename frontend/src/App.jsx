import { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import Toasts from './components/Toasts';

// Components
const Navbar = lazy(() => import('./components/user/Navbar'));
const AuthModal = lazy(() => import('./components/user/AuthModal'));
const Chatbot = lazy(() => import('./components/user/Chatbot'));
const Footer = lazy(() => import('./components/user/Footer'));
const QuizModal = lazy(() => import('./components/user/QuizModal'));
const AdminLogin = lazy(() => import('./components/admin/AdminLogin'));

// Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));

import './App.css';

const App = () => {
  const fetchProducts = useAppStore((state) => state.fetchProducts);
  const fetchChannelProducts = useAppStore((state) => state.fetchChannelProducts);
  const fetchOrders = useAppStore((state) => state.fetchOrders);
  const user = useAppStore((state) => state.user);
  const products = useAppStore((state) => state.products);
  const channelProducts = useAppStore((state) => state.channelProducts);
  const orders = useAppStore((state) => state.orders);
  const cart = useAppStore((state) => state.cart);
  const cartNote = useAppStore((state) => state.cartNote);
  const setCartNote = useAppStore((state) => state.setCartNote);
  const updateCartQty = useAppStore((state) => state.updateCartQty);
  const setCartItemQty = useAppStore((state) => state.setCartItemQty);
  const removeFromCart = useAppStore((state) => state.removeFromCart);

  const location = useLocation();
  const navigate = useNavigate();

  const [isCartOpen, setIsCartOpen] = useState(false);
  useEffect(() => {
    fetchProducts();
    fetchChannelProducts();
  }, [fetchChannelProducts, fetchProducts]);

  const normalizedPathname = location.pathname.toLowerCase();
  const isAdminRoute = normalizedPathname.startsWith('/admin');
  const isAdminUser = String(user?.role || '').trim().toLowerCase() === 'admin';

  useEffect(() => {
    if (isAdminRoute && isAdminUser) {
      fetchOrders();
    }
  }, [fetchOrders, isAdminRoute, isAdminUser]);

  const refreshAdminData = useCallback(() => {
    fetchProducts();
    fetchChannelProducts();
    if (isAdminUser) {
      fetchOrders();
    }
  }, [fetchChannelProducts, fetchOrders, fetchProducts, isAdminUser]);

  useEffect(() => {
    if (location.pathname !== normalizedPathname && normalizedPathname.startsWith('/admin')) {
      navigate(`${normalizedPathname}${location.search}${location.hash}`, { replace: true });
    }
  }, [location.hash, location.pathname, location.search, navigate, normalizedPathname]);

  const vnd = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price * 24000);
  const cartTotal = cart.reduce((s, item) => s + item.price * item.quantity, 0);
  const routeFallback = <div className="loading-state">Đang tải...</div>;
  const uiFallback = <></>;

  return (
    <div className={`app-container ${isAdminRoute ? 'admin-app' : 'user-app'}`}>
      <Suspense fallback={uiFallback}>
        {!isAdminRoute && <Navbar setIsCartOpen={setIsCartOpen} />}
      </Suspense>

      <main className="main-content">
        <Suspense fallback={routeFallback}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route
              path="/admin/*"
              element={
                isAdminUser ? (
                  <AdminDashboard
                    products={products}
                    channelProducts={channelProducts}
                    orders={orders}
                    user={user}
                    onRefresh={refreshAdminData}
                  />
                ) : (
                  <AdminLogin />
                )
              }
            />
          </Routes>
        </Suspense>
      </main>

      <Suspense fallback={uiFallback}>
        {!isAdminRoute && <Footer />}
        {!isAdminRoute && <Chatbot />}
        {!isAdminRoute && <QuizModal />}
        {!isAdminRoute && <AuthModal />}
      </Suspense>

      <Toasts />

      {!isAdminRoute && (
        <>
          <div className={`cart-overlay ${isCartOpen ? 'active' : ''}`} onClick={() => setIsCartOpen(false)}></div>
          <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
            <div className="cart-header">
              <div>
                <p className="cart-kicker">Giỏ hàng</p>
                <h2>Giỏ của bạn ({cart.reduce((a, item) => a + item.quantity, 0)})</h2>
              </div>
              <button className="cart-close" aria-label="Đóng giỏ hàng" onClick={() => setIsCartOpen(false)}>×</button>
            </div>
            <div className="cart-content">
              {cart.length === 0 ? (
                <div className="cart-empty-state">
                  <div className="cart-empty-icon">Giỏ</div>
                  <h3>Giỏ hàng đang trống</h3>
                  <p>Thêm sản phẩm để xem tại đây cùng điều chỉnh số lượng và tóm tắt thanh toán nhanh.</p>
                  <button className="btn-gold" onClick={() => { setIsCartOpen(false); navigate('/'); }}>Tiếp tục mua sắm</button>
                </div>
              ) : cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-img">
                    <img src={item.imageUrl} alt={item.name} />
                  </div>
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    {item.engraving && <div className="cart-item-engraving">Khắc tên: {item.engraving}</div>}
                  </div>
                  <div className="cart-item-qty">
                    <div className="cart-qty-ctrl">
                      <button
                        type="button"
                        aria-label={`Giảm số lượng ${item.name}`}
                        disabled={item.quantity <= 1}
                        onClick={() => updateCartQty(item.id, -1)}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => setCartItemQty(item.id, e.target.value)}
                        aria-label={`Số lượng ${item.name}`}
                      />
                      <button
                        type="button"
                        aria-label={`Tăng số lượng ${item.name}`}
                        onClick={() => updateCartQty(item.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-price-col">
                    <p className="price">{vnd(item.price * item.quantity)}</p>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Xóa</button>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="cart-footer">
                <label className="cart-notes-label" htmlFor="cart-notes">Ghi chú đơn hàng</label>
                <textarea
                  id="cart-notes"
                  className="form-input cart-notes"
                  placeholder="Lời nhắn quà tặng, yêu cầu giao hàng hoặc ghi chú đặc biệt"
                  value={cartNote}
                  onChange={(e) => setCartNote(e.target.value)}
                />
                <div className="cart-summary-row">
                  <span>Tổng cộng</span>
                  <span className="cart-summary-value">{vnd(cartTotal)}</span>
                </div>
                <button
                  className="btn-gold cart-checkout-btn"
                  onClick={() => { setIsCartOpen(false); navigate('/checkout'); }}
                >
                  Thanh toán
                </button>
                <button
                  type="button"
                  className="cart-secondary-btn"
                  onClick={() => { setIsCartOpen(false); navigate('/cart'); }}
                >
                  Xem trang giỏ hàng
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default App;

