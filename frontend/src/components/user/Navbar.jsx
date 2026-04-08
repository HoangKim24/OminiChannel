import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

const Navbar = ({ setIsCartOpen }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const user = useAppStore(state => state.user);
  const logout = useAppStore(state => state.logout);
  const cart = useAppStore(state => state.cart);
  const products = useAppStore(state => state.products);
  const setAuthModal = useAppStore(state => state.setAuthModal);
  const searchTerm = useAppStore(state => state.searchTerm);
  const setSearchTerm = useAppStore(state => state.setSearchTerm);
  const setQuizOpen = useAppStore(state => state.setQuizOpen);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (location.pathname.startsWith('/admin')) return null;

  const cartCount = cart.reduce((a, b) => a + b.quantity, 0);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const closeMenu = () => setIsMenuOpen(false);
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const vnd = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

  const openProfile = () => {
    closeMenu();
    navigate('/profile');
    closeMobileMenu();
  };

  const openInvoiceDetails = () => {
    closeMenu();
    navigate('/orders/latest');
    closeMobileMenu();
  };

  const openQuestionFinder = () => {
    setQuizOpen(true);
    closeMenu();
    closeMobileMenu();
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    closeMobileMenu();
    navigate('/');
  };

  return (
    <nav className={scrolled ? 'scrolled' : ''}>
      <div className="container">
        <Link to="/" className="logo" onClick={() => { closeMenu(); closeMobileMenu(); }}>KP LUXURY</Link>
        <button
          className="mobile-menu-toggle"
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          ☰
        </button>
        
        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="nav-search-container">
            <input 
              type="text" 
              className="nav-search-input" 
              placeholder="🔍 Tìm kiếm sản phẩm..." 
              value={searchTerm}
              aria-label="Tìm kiếm sản phẩm nước hoa"
              onFocus={() => setIsSearchOpen(true)} 
              onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
              onChange={e => { setSearchTerm(e.target.value); if(location.pathname !== '/') navigate('/'); }} 
            />
            {searchTerm && isSearchOpen && (
              <div className="search-suggest-dropdown" role="listbox" aria-label="Gợi ý tìm kiếm">
                {filteredProducts.slice(0, 5).map((p) => (
                  <div 
                    key={p.id} 
                    className="suggest-item" 
                    role="option"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        navigate(`/product/${p.id}`);
                        setIsSearchOpen(false);
                        setSearchTerm('');
                        closeMobileMenu();
                      }
                    }}
                    onClick={() => { navigate(`/product/${p.id}`); setIsSearchOpen(false); setSearchTerm(''); closeMobileMenu(); }}>
                    <img src={p.imageUrl} alt={p.name} />
                    <div className="suggest-info">
                      <h4>{p.name}</h4>
                      <p>{vnd(p.price)}</p>
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && <div style={{ padding: '1rem', color: '#888' }}>Không tìm thấy sản phẩm.</div>}
              </div>
            )}
          </div>

          <Link to="/" className="nav-link-btn" onClick={closeMobileMenu}>Bộ Sưu Tập</Link>

          <div className="nav-menu-wrap">
            <button
              type="button"
              className="nav-link-btn nav-menu-btn"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Mở menu hồ sơ"
              aria-expanded={isMenuOpen}
            >
              ☰
            </button>

            {isMenuOpen && (
              <div className="nav-menu-panel" role="menu" aria-label="Menu hồ sơ">
                <button type="button" className="nav-menu-item" onClick={openProfile}>Hồ sơ</button>
                <button type="button" className="nav-menu-item" onClick={openInvoiceDetails}>Chi tiết hóa đơn</button>
                <button type="button" className="nav-menu-item" onClick={openQuestionFinder}>Câu hỏi</button>
                {user ? (
                  <button type="button" className="nav-menu-item danger" onClick={handleLogout}>Đăng xuất</button>
                ) : (
                  <button type="button" className="nav-menu-item" onClick={() => { setAuthModal('login'); closeMenu(); closeMobileMenu(); }}>Đăng nhập</button>
                )}
              </div>
            )}
          </div>

          <button type="button" className="cart-cta" onClick={() => { setIsCartOpen(true); closeMobileMenu(); }}>
            <span>🛒</span>
            <strong>{cartCount}</strong>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

