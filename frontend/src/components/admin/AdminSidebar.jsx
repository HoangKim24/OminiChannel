const AdminSidebar = ({ activeTab, setActiveTab, setPage, isMobileOpen, setIsMobileOpen }) => {
  const menuItems = [
    { id: 'overview', label: 'TỔNG QUAN' },
    { id: 'products', label: 'SẢN PHẨM' },
    { id: 'orders', label: 'ĐƠN HÀNG' },
    { id: 'crm', label: 'KHÁCH HÀNG' },
    { id: 'inventory', label: 'KHO HÀNG' },
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
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="admin-sidebar-footer">
        <button className="admin-nav-item return-home-btn" onClick={() => setPage('home')}>
             <span>Về Trang Chủ</span>
         </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
