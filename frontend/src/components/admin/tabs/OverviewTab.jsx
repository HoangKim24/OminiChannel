import React, { useState, useEffect } from 'react';
import { vnd } from '../../../utils/format';

const OverviewTab = ({ products, orders, cartTotal, user }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/statistics/dashboard', {
          headers: { 'X-User-Role': user?.role || 'Admin' }
        });
        if (res.ok) {
          setDashboardData(await res.json());
        }
      } catch (err) { console.error('Dashboard fetch error:', err); }
      finally { setLoading(false); }
    };
    fetchDashboard();
  }, [user, orders]);

  const totalOrders = dashboardData?.totalOrders ?? (Array.isArray(orders) ? orders.length : 0);
  const totalRevenue = dashboardData?.totalRevenue ?? (Array.isArray(orders) ? orders.reduce((s, o) => s + (o.totalAmount ?? o.TotalAmount ?? 0), 0) : 0);
  const totalProducts = dashboardData?.totalProducts ?? (products?.length || 0);
  const totalCustomers = dashboardData?.totalCustomers ?? 0;
  const recentOrders = dashboardData?.recentOrders ?? [];
  const lowStockProducts = dashboardData?.lowStockProducts ?? [];

  const stats = [
    { label: 'Tổng Doanh Thu', val: vnd(totalRevenue), icon: '💰', trend: totalOrders ? `+${totalOrders} đơn` : '—' },
    { label: 'Số Đơn Hàng', val: totalOrders.toString(), icon: '📦', trend: totalOrders ? 'Hoạt động' : 'Chưa có dữ liệu' },
    { label: 'Số Sản Phẩm', val: totalProducts.toString(), icon: '💎', trend: totalProducts ? 'Đang bán' : 'Chưa có sản phẩm' },
    { label: 'Khách Hàng', val: totalCustomers.toString(), icon: '🚀', trend: totalCustomers ? `${totalCustomers} tài khoản` : 'Chưa có khách' },
  ];

  return (
    <div className="fade-in">
      <div className="admin-tab-header">
        <h2 className="brand-font page-title">📊 Toàn cảnh hệ thống</h2>
        <div className="admin-status-bar">
           📅 {new Date().toLocaleDateString('vi-VN')} | 🔔 {lowStockProducts.length > 0 ? `${lowStockProducts.length} cảnh báo tồn kho` : 'Hệ thống ổn định'}
        </div>
      </div>

      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card shadow-gold">
            <div className="stat-header">
              <span className="stat-icon">{s.icon}</span>
              <span className="stat-trend">{s.trend}</span>
            </div>
            <div className="stat-val">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-row main-stats-row">
        <div className="admin-panel glass chart-container">
          <h3 className="brand-font section-subtitle">📈 Biểu đồ Doanh Thu</h3>
          <div className="chart-wrapper">
             {/* Chart: giữ placeholder vì chưa có dữ liệu time-series trong DB */}
             {[65, 40, 85, 55, 95, 70, 80].map((h, i) => (
                <div key={i} className="chart-bar-container">
                   <div style={{ width: '100%', height: `${h}%`, background: i === 4 ? 'var(--luxury-gold-bright)' : 'rgba(255,255,255,0.05)', borderRadius: '4px 4px 0 0', position: 'relative', transition: '0.5s' }}>
                      <div className="chart-tooltip">{h*1.2}M</div>
                   </div>
                   <span className="chart-label">T{i+2}</span>
                </div>
             ))}
          </div>
          <p className="chart-note">* Dữ liệu tĩnh (chưa có time-series trong DB). Tổng doanh thu thật: {vnd(totalRevenue)}</p>
        </div>
      </div>

      <div className="dashboard-row secondary-stats-row">
        <div className="admin-panel glass orders-container">
          <h3 className="brand-font section-subtitle">🔔 Đơn Hàng Mới nhất</h3>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã Đơn</th>
                  <th>Khách Hàng</th>
                  <th>Trạng Thái</th>
                  <th>Tổng</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>{o.customerName || 'Khách hàng'}</td>
                      <td>
                        <span className={o.status?.toLowerCase().includes('pending') ? 'status-pending' : 'status-processing'}>
                          {o.status}
                        </span>
                      </td>
                      <td>{vnd(o.totalAmount)}</td>
                    </tr>
                  ))
                ) : Array.isArray(orders) && orders.length > 0 ? (
                  orders.slice(0, 5).map((o) => {
                    const id = o.id ?? o.Id;
                    const status = o.status ?? o.Status ?? 'Chờ xử lý';
                    const amount = o.totalAmount ?? o.TotalAmount ?? 0;
                    return (
                      <tr key={id}>
                        <td>#{id}</td>
                        <td>Khách hàng</td>
                        <td>
                          <span className={status.includes('Chờ') || status.toLowerCase().includes('pending') ? 'status-pending' : 'status-processing'}>
                            {status}
                          </span>
                        </td>
                        <td>{vnd(amount)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={4} style={{ color: '#666', fontSize: '0.9rem' }}>Chưa có đơn hàng nào từ phía khách.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="admin-panel glass warnings-container">
          <h3 className="brand-font section-subtitle">⚠️ Cảnh Báo Hệ Thống</h3>
          <div style={{ display: 'grid', gap: '0.8rem', marginTop: '1rem' }}>
             {lowStockProducts.length > 0 ? (
               lowStockProducts.map(p => (
                 <div key={p.id} style={{ padding: '0.8rem', background: 'rgba(231, 76, 60, 0.05)', borderLeft: '3px solid #e74c3c', fontSize: '0.8rem' }}>
                   <strong>Tồn kho thấp:</strong> {p.name} — còn {p.stockQuantity} sản phẩm.
                 </div>
               ))
             ) : (
               <div style={{ padding: '0.8rem', background: 'rgba(39, 174, 96, 0.05)', borderLeft: '3px solid #27ae60', fontSize: '0.8rem' }}>
                 <strong>✓ Tất cả sản phẩm đều đủ tồn kho.</strong>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
