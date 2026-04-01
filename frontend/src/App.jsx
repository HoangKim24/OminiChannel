import { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import Toasts from './components/Toasts';

// Components
const Navbar = lazy(() => import('./components/user/Navbar'));
const AuthModal = lazy(() => import('./components/user/AuthModal'));
const Chatbot = lazy(() => import('./components/user/Chatbot'));
const Footer = lazy(() => import('./components/user/Footer'));
const QuizModal = lazy(() => import('./components/user/QuizModal'));

// Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));

import './App.css';

const App = () => {
  const fetchProducts = useAppStore(state => state.fetchProducts);
  const location = useLocation();
  const navigate = useNavigate();
  
  // UI State handled locally for sidebar menu
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartNotes, setCartNotes] = useState('');

  // Global UI State
  const toasts = useAppStore(state => state.toasts);
  
  // Global Data
  const cart = useAppStore(state => state.cart);
  const updateCartQty = useAppStore(state => state.updateCartQty);
  const removeFromCart = useAppStore(state => state.removeFromCart);
  
  // Fetch data on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const vnd = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price * 24000);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const routeFallback = <div className="loading-state">Loading...</div>;
  const uiFallback = <></>;

  return (
    <div className={`app-container ${isAdminRoute ? 'admin-app' : 'user-app'}`}>
      
      {/* Navbar */}
      <Suspense fallback={uiFallback}>
        {!isAdminRoute && <Navbar setIsCartOpen={setIsCartOpen} />}
      </Suspense>

      <main className="main-content">
        <Suspense fallback={routeFallback}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Routes>
        </Suspense>
      </main>

      {/* Global Overlays */}
      <Suspense fallback={uiFallback}>
        {!isAdminRoute && <Footer />}
        {!isAdminRoute && <Chatbot />}
        {!isAdminRoute && <QuizModal />}
        <AuthModal />
      </Suspense>
      
      {/* Toast Notifications */}
      <Toasts />

      {/* Quick Cart Sidebar */}
      {!isAdminRoute && (
        <>
          <div className={`cart-overlay ${isCartOpen ? 'active' : ''}`} onClick={() => setIsCartOpen(false)}></div>
          <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
            <div className="cart-header">
              <h2>Giỏ hàng của bạn ({cart.reduce((a, b) => a + b.quantity, 0)})</h2>
              <button className="icon-btn" style={{ fontSize: '1.5rem', color: '#888' }} onClick={() => setIsCartOpen(false)}>✕</button>
            </div>
            <div className="cart-content" style={{ flex: 1, overflowY: 'auto' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>Giỏ hàng trống</div>
              ) : cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-img">
                    <img src={item.imageUrl} alt={item.name} />
                  </div>
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    {item.engraving && <div className="cart-item-engraving">Khắc: {item.engraving}</div>}
                  </div>
                  <div className="cart-item-qty">
                    <div className="cart-qty-ctrl">
                      <button onClick={() => updateCartQty(item.id, -1)}>−</button>
                      <input type="number" value={item.quantity} readOnly />
                      <button onClick={() => updateCartQty(item.id, 1)}>+</button>
                    </div>
                  </div>
                  <div className="cart-item-price-col">
                    <p className="price">{vnd(item.price * item.quantity)}</p>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>✕ Loại bỏ</button>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="cart-footer" style={{ borderTop: '1px solid #222', paddingTop: '1rem', marginTop: 'auto' }}>
                <textarea className="form-input" style={{ width: '100%', background: '#111', fontSize: '0.85rem', marginBottom: '1rem' }} placeholder="Ghi chú đơn hàng (quà tặng...)" value={cartNotes} onChange={e => setCartNotes(e.target.value)} />
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  <span>Tổng cộng:</span>
                  <span style={{ color: 'var(--accent-gold)' }}>{vnd(cartTotal)}</span>
                </div>
                <button className="btn-gold" style={{ width: '100%', display: 'block', textAlign: 'center' }} onClick={() => { setIsCartOpen(false); navigate('/checkout'); }}>Thanh Toán Trực Tuyến</button>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
};

export default App;

