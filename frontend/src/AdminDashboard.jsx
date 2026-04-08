import { useLocation } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import OverviewTab from './components/admin/tabs/OverviewTab';
import OrdersTab from './components/admin/tabs/OrdersTab';
import ProductsTab from './components/admin/tabs/ProductsTab';
import InventoryTab from './components/admin/tabs/InventoryTab';
import CustomersTab from './components/admin/tabs/CustomersTab';
import AdminAccountsTab from './components/admin/tabs/AdminAccountsTab';
import VouchersTab from './components/admin/tabs/VouchersTab';

const AdminDashboard = ({ products, channelProducts, cartTotal, orders, setPage, user, onRefresh }) => {
  const location = useLocation();

  const normalizedPath = location.pathname.toLowerCase();

  const activeTab = (() => {
    if (normalizedPath.startsWith('/admin/products')) return 'products';
    if (normalizedPath.startsWith('/admin/orders')) return 'orders';
    if (normalizedPath.startsWith('/admin/inventory')) return 'inventory';
    if (normalizedPath.startsWith('/admin/vouchers')) return 'voucher-management';
    if (normalizedPath.startsWith('/admin/customers')) return 'customers';
    if (normalizedPath.startsWith('/admin/admin-accounts')) return 'admin-accounts';
    return 'overview';
  })();

  return (
    <AdminLayout>
      <section className="admin-canvas">
        {activeTab === 'overview' && <OverviewTab products={products} orders={orders} cartTotal={cartTotal} user={user} />}
        {activeTab === 'products' && <ProductsTab products={products} user={user} onRefresh={onRefresh} />}
        {activeTab === 'orders' && <OrdersTab orders={orders} user={user} onRefresh={onRefresh} />}
        {activeTab === 'inventory' && <InventoryTab products={products} channelProducts={channelProducts} user={user} />}
        {activeTab === 'voucher-management' && <VouchersTab user={user} />}
        {activeTab === 'customers' && <CustomersTab user={user} />}
        {activeTab === 'admin-accounts' && <AdminAccountsTab user={user} onRefresh={onRefresh} />}
      </section>
    </AdminLayout>
  );
};

export default AdminDashboard;

