import React from 'react';
import './DashboardStats.css';
// Sử dụng thư viện react-icons nếu đã cài đặt, hoặc chèn inline SVG nếu không
// Nếu bạn chưa chạy: npm install react-icons, hãy chạy lệnh đó trước!
// Dưới đây tôi dùng Inline SVG chuẩn thay cho react-icons để chắc chắn chạy không dính lỗi thiếu thư viện, nhưng thiết kế hoàn toàn hệt như đang dùng react-icons.

const DashboardStats = () => {
  const statsData = [
    {
      id: 1,
      title: 'Tổng doanh thu',
      value: '$124,500',
      trend: '+15%',
      isPositive: true,
      timeframe: 'so với tháng trước',
      // Biểu tượng Tiền/Doanh thu
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      )
    },
    {
      id: 2,
      title: 'Đơn hàng mới',
      value: '1,245',
      trend: '+8.2%',
      isPositive: true,
      timeframe: 'so với tháng trước',
      // Biểu tượng Giỏ hàng/Đơn
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      )
    },
    {
      id: 3,
      title: 'Tỷ lệ chuyển đổi',
      value: '4.83%',
      trend: '-1.4%',
      isPositive: false, // Bị giảm sút
      timeframe: 'so với tháng trước',
      // Biểu tượng Mũi tên Biểu đồ
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
      )
    },
    {
      id: 4,
      title: 'Sắp hết hàng',
      value: '12',
      trend: '+2.1%',
      isPositive: false, // Tăng sản phẩm hết hàng là tín hiệu không tốt
      timeframe: 'so với tuần trước',
      // Biểu tượng Cảnh báo/Tồn kho
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      )
    }
  ];

  return (
    <div className="stats-grid">
      {statsData.map((stat) => (
        <div key={stat.id} className="stat-card">
          <div className="stat-header">
            <h3 className="stat-title">{stat.title}</h3>
            <div className="stat-iconwrapper">
              {stat.icon}
            </div>
          </div>
          
          <div className="stat-content">
            <div className="stat-value">{stat.value}</div>
            
            <div className="stat-footer">
              <span className={`stat-trend ${stat.isPositive ? 'trend-up' : 'trend-down'}`}>
                {stat.isPositive ? (
                  <svg className="trend-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                  </svg>
                ) : (
                  <svg className="trend-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                    <polyline points="17 18 23 18 23 12"></polyline>
                  </svg>
                )}
                {stat.trend}
              </span>
              <span className="stat-timeframe">{stat.timeframe}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
