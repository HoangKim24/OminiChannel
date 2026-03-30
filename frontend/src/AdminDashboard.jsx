import { useState } from 'react';
import AdminSidebar from './components/admin/AdminSidebar';
import OverviewTab from './components/admin/tabs/OverviewTab';
import OrdersTab from './components/admin/tabs/OrdersTab';
import ProductsTab from './components/admin/tabs/ProductsTab';
import InventoryTab from './components/admin/tabs/InventoryTab';
import CrmTab from './components/admin/tabs/CrmTab';
import './styles/AdminDashboard.css';

const AdminDashboard = ({ products, cartTotal, orders, setPage, user, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={`admin-screen fade-in ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="admin-overlay" onClick={() => setIsSidebarOpen(false)}></div>

      <div className="admin-sidebar-container">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} setPage={setPage} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} />
      </div>

      <div className="admin-body">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="mobile-toggle" onClick={() => setIsSidebarOpen(true)}>☰</button>
            <div className="admin-breadcrumb">
              <span className="root">ADMIN</span>
              <span className="sep">/</span>
              <span className="current">{activeTab.toUpperCase()}</span>
            </div>
          </div>
          <div className="admin-status">
            <div className="status-indicator">● HỆ THỐNG TRỰC TUYẾN</div>
            <div className="admin-user">
              <span>{user?.fullName || user?.username || 'Super Admin'}</span>
              <div className="avatar luxury-glow" aria-hidden="true">
                <span className="avatar-icon">👤</span>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-canvas">
          {activeTab === 'overview' && <OverviewTab products={products} orders={orders} cartTotal={cartTotal} user={user} />}
          {activeTab === 'products' && <ProductsTab products={products} user={user} onRefresh={onRefresh} />}
          {activeTab === 'orders' && <OrdersTab orders={orders} user={user} onRefresh={onRefresh} />}
          {activeTab === 'inventory' && <InventoryTab products={products} />}
          {activeTab === 'crm' && <CrmTab orders={orders} user={user} />}
        </main>
      </div>

    </div>
  );
};

export default AdminDashboard;
