const Footer = ({ page }) => {
  if (page === 'admin') return null;

  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h2 className="brand-font footer-brand">KP LUXURY</h2>
            <p>Tinh hoa nghệ thuật mùi hương, được tuyển chọn cho phong cách sống hiện đại.</p>
          </div>

          <div className="footer-col">
            <h3>Khám phá</h3>
            <a href="#products">Bộ sưu tập</a>
            <a href="#">Fragrance Finder</a>
            <a href="#">Chính sách đổi trả</a>
          </div>

          <div className="footer-col">
            <h3>Hỗ trợ</h3>
            <p>Hotline: 0563750400</p>
            <p>Email: nlhk2403@gmail.com</p>
            <p>Địa chỉ tiệm: 70/55/15 Nguyễn Sỹ Sách Phường Tân Sơn</p>
            <p>08:30 - 22:00 mỗi ngày</p>
          </div>

          <div className="footer-col">
            <h3>Kết nối</h3>
            <div className="footer-socials">
              <a href="#" aria-label="Facebook">FB</a>
              <a href="#" aria-label="Instagram">IG</a>
              <a href="#" aria-label="TikTok">TT</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {year} KP Luxury Perfume. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
