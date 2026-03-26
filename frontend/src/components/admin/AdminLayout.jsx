import React, { useState } from 'react';
import './AdminLayout.css';

const AdminLayout = ({ children, activePath = '/admin/dashboard' }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Danh sách menu linh hoạt (có thể trỏ từ file config/routes)
  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { name: 'Products', path: '/admin/products', icon: 'M20 16.2A2 2 0 0 1 18.2 18H5.8A2 2 0 0 1 4 16.2V7.8A2 2 0 0 1 5.8 6h12.4a2 2 0 0 1 1.8 1.8v8.4zm-9.2-4.1l2.4 2.4-2.4 2.4' }, // Ví dụ dạng Box
    { name: 'Orders', path: '/admin/orders', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6' },
    { name: 'Inventory', path: '/admin/inventory', icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
    { name: 'CRM', path: '/admin/crm', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' }
  ];

  return (
    <div className="al-layout">
      {/* Mobile Overlay */}
      {isSidebarOpen && <div className="al-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Sidebar (Left) */}
      <aside className={`al-sidebar ${isSidebarOpen ? 'al-sidebar-open' : ''}`}>
        <div className="al-sidebar-header">
          <div className="al-logo">KP LUXURY</div>
          {/* Nút đóng Sidebar chỉ hiện trên mobile */}
          <button className="al-close-btn" onClick={() => setSidebarOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav className="al-nav">
          <ul>
            {menuItems.map((item, index) => {
              const isActive = activePath === item.path;
              return (
                <li key={index}>
                  <a href={item.path} className={`al-nav-link ${isActive ? 'active' : ''}`}>
                    <svg className="al-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={item.icon}></path>
                    </svg>
                    <span>{item.name}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Cấu hình dưới cùng Sidebar (Tùy chọn) */}
        <div className="al-sidebar-footer">
          <a href="/admin/settings" className="al-nav-link">
            <svg className="al-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>Settings</span>
          </a>
        </div>
      </aside>

      {/* Main Wrapper (Header + Content) */}
      <div className="al-main-wrapper">
        <header className="al-header">
          {/* Menu button cho Mobile/Tablet */}
          <button className="al-menu-btn" onClick={() => setSidebarOpen(true)}>
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
             </svg>
          </button>

          {/* Spotlight Search (Mờ kính) */}
          <div className="al-search-box">
             <svg className="al-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
               <circle cx="11" cy="11" r="8"></circle>
               <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
             </svg>
             <input type="text" placeholder="Search (Cmd/Ctrl + K)" />
          </div>

          <div className="al-header-actions">
            {/* Nút thông báo */}
            <button className="al-noti-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span className="al-noti-dot"></span>
            </button>
            
            {/* Avatar Admin */}
            <div className="al-avatar">
              <img src="https://i.pravatar.cc/150?u=admin_kp" alt="Admin Avatar" />
            </div>
          </div>
        </header>

        {/* Khu vực nội dung chính */}
        <main className="al-content">
          <div className="al-content-inner">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
