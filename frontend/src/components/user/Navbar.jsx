import React from 'react';

const Navbar = ({
  page, setPage, scrolled, isMobileMenuOpen, setIsMobileMenuOpen,
  searchTerm, setSearchTerm, isSearchOpen, setIsSearchOpen,
  filteredProducts, openDetail, resetQuiz, favorites, user, logout,
  setAuthModal, cart, setIsCartOpen, vnd
}) => {
  if (page === 'admin') return null;

  const cartCount = cart.reduce((a, b) => a + b.quantity, 0);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className={scrolled ? 'scrolled' : ''}>
      <div className="container">
        <a href="#" className="logo" aria-label="Về trang chủ" onClick={e => { e.preventDefault(); setPage('home'); closeMobileMenu(); }}>KP LUXURY</a>
        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={isMobileMenuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          ☰
        </button>
        
        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          
          <div className="nav-search-container">
            <input type="text" className="nav-search-input" placeholder="🔍 Tìm kiếm sản phẩm..." value={searchTerm}
                   aria-label="Tìm kiếm sản phẩm"
                   onFocus={() => setIsSearchOpen(true)} 
                   onChange={e => { setSearchTerm(e.target.value); if(page !== 'home') setPage('home') }} />
            {searchTerm && isSearchOpen && (
              <div className="search-suggest-dropdown" onMouseLeave={() => setIsSearchOpen(false)}>
                {filteredProducts.slice(0, 5).map(p => (
                  <div key={p.id} className="suggest-item" onClick={() => { openDetail(p); setIsSearchOpen(false); setSearchTerm(''); closeMobileMenu(); }}>
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

          <button type="button" className="nav-link-btn" onClick={() => { resetQuiz(); closeMobileMenu(); }}>Fragrance Finder</button>
          <button type="button" className="nav-link-btn" onClick={() => { setPage('home'); closeMobileMenu(); }}>Bộ Sưu Tập</button>
          <button type="button" className="nav-link-btn" onClick={() => { setPage('favorites'); closeMobileMenu(); }}>
            ❤️ Yêu Thích ({favorites.length})
          </button>
          
          {user ? (
            <>
              <span className="nav-user-chip">
                Chào, {user.username}
              </span>
              <button type="button" className="nav-link-btn" onClick={() => { logout(); closeMobileMenu(); }}>Đăng Xuất</button>
            </>
          ) : (
            <button type="button" className="nav-link-btn" onClick={() => { setAuthModal('login'); closeMobileMenu(); }}>Đăng Nhập</button>
          )}

          <button type="button" className="cart-cta" onClick={() => { setIsCartOpen(true); closeMobileMenu(); }}>
            <span>🛒 Giỏ Hàng</span>
            <strong>{cartCount}</strong>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
