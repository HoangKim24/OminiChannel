import { useNavigate } from 'react-router-dom';

const AdminSidebar = ({ activeTab, setActiveTab, setPage, isMobileOpen, setIsMobileOpen }) => {
  const navigate = useNavigate();
  const menuItems = [
    { id: 'overview', label: 'TỔNG QUAN' },
    { id: 'products', label: 'SẢN PHẨM' },
    { id: 'orders', label: 'ĐƠN HÀNG' },
    { id: 'voucher-management', label: 'MÃ GIẢM GIÁ' },
    { id: 'customers', label: 'KHÁCH HÀNG' },
    { id: 'admin-accounts', label: 'TÀI KHOẢN ADMIN' },
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
        <button
          className="admin-nav-item return-home-btn"
          onClick={() => {
            if (typeof setPage === 'function') {
              setPage('home');
              return;
            }

            navigate('/');
            if (setIsMobileOpen) setIsMobileOpen(false);
          }}
        >
             <span>Về Trang Chủ</span>
         </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
