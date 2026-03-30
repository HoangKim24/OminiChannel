import React from 'react';

const Hero = ({ resetQuiz }) => {
  return (
    <div className="hero">
      <div className="hero-content">
        <p>Nghệ Thuật Của Hương Thơm Vượt Thời Gian</p>
        <h1>Tinh Hoa Nước Hoa Cao Cấp</h1>
        <div className="hero-actions">
          <a href="#products" className="btn-gold">Khám Phá Ngay</a>
          <button type="button" className="btn-outline" onClick={resetQuiz}>Tư Vấn Mùi Hương</button>
        </div>
        <div className="hero-proof">
          <div className="proof-item">
            <strong>100%</strong>
            <span>Chính hãng</span>
          </div>
          <div className="proof-item">
            <strong>2H</strong>
            <span>Giao nhanh nội thành</span>
          </div>
          <div className="proof-item">
            <strong>30 ngày</strong>
            <span>Đổi trả dễ dàng</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
