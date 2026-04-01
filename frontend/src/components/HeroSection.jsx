import { useState, useEffect } from 'react';
import './HeroSection.css';

const HeroSection = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Kích hoạt hiệu ứng fade-in khi component mount
    setIsLoaded(true);

    // Xử lý hiệu ứng scroll cho Navbar Glassmorphism
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="hero-container">
      {/* Navbar với hiệu ứng Glassmorphism */}
      <nav className={`hero-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-logo">KP LUXURY</div>
        <ul className="nav-links">
          <li><a href="#collections">Bộ sưu tập</a></li>
          <li><a href="#about">Về chúng tôi</a></li>
          <li><a href="#contact">Liên hệ</a></li>
        </ul>
        <div className="nav-icons">
          <button className="icon-btn" aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
          <button className="icon-btn" aria-label="Cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          </button>
        </div>
      </nav>

      {/* Hero Background */}
      <div className="hero-background">
        <div className="overlay"></div>
        {/* URL ảnh tĩnh hoặc ảnh local tùy vào assets của dự án */}
        <img 
          src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=2600&auto=format&fit=crop" 
          alt="Luxury Perfume" 
          className={`bg-image ${isLoaded ? 'zoom-in' : ''}`}
        />
      </div>

      {/* Hero Content */}
      <div className={`hero-content ${isLoaded ? 'fade-in-up' : ''}`}>
        <div className="hero-subtitle">BỘ SƯU TẬP ĐỘC QUYỀN 2026</div>
        <h1 className="hero-title">Đánh thức<br/>Giác quan của bạn</h1>
        <p className="hero-description">
          Khám phá nghệ thuật chế tác nước hoa đỉnh cao với những nốt hương tinh tế, 
          mang đậm dấu ấn thượng lưu và quyền quý.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary">Khám phá Bộ sưu tập</button>
          <button className="btn btn-outline">Tìm mùi hương của bạn</button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

