import React from 'react';

const AdminSidebar = ({ activeTab, setActiveTab, setPage, isMobileOpen, setIsMobileOpen }) => {
  const menuItems = [
    { id: 'overview', label: 'Tổng Quan', icon: '📊' },
    { id: 'products', label: 'Sản Phẩm', icon: '💎' },
    { id: 'orders', label: 'Đơn Hàng', icon: '📜' },
    { id: 'crm', label: 'Khách Hàng', icon: '👤' },
    { id: 'inventory', label: 'Kho Hàng', icon: '📦' },
    { id: 'inventory', label: 'Kho Hàng', icon: '📦' },
  ];

  return (
    <aside className={`admin-sidebar luxury-glow ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="admin-logo">KP ADMIN</div>
      <nav className="admin-nav">
        {menuItems.map(item => (
          <button 
            key={item.id} 
            className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`} 
            onClick={() => { 
                setActiveTab(item.id); 
                if (setIsMobileOpen) setIsMobileOpen(false); 
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="admin-sidebar-footer" style={{ marginTop: 'auto', borderTop: '1px solid var(--admin-border)', paddingTop: '1rem' }}>
         <button className="admin-nav-item" onClick={() => setPage('home')} style={{ color: 'var(--admin-gold)', border: '1px solid var(--admin-gold)' }}>
            <span className="nav-icon">🏠</span>
            <span>Về Trang Chủ</span>
         </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
