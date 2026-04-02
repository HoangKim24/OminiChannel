import { useState, useEffect, useMemo } from 'react';
import { vnd } from '../../../utils/format';
import { useToast } from '../../../utils/toastContext.jsx';
import CustomerDetailModal from '../modals/CustomerDetailModal';

const CustomersTab = ({ user }) => {
  const { error } = useToast();
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/statistics/customers', {
          headers: { 'X-User-Role': user?.role || 'Admin' }
        });
        if (!res.ok) throw new Error('Failed to fetch customers');
        const data = await res.json();
        setCustomers(Array.isArray(data) ? data : []);
      } catch (err) {
        error(`Lỗi tải khách hàng: ${err.message}`);
        console.error('Fetch customers error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [user?.role, error]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const query = searchQuery.toLowerCase();
      return (
        (c.username || '').toLowerCase().includes(query) ||
        (c.fullName || '').toLowerCase().includes(query) ||
        (c.email || '').toLowerCase().includes(query) ||
        (c.phoneNumber || '').toLowerCase().includes(query)
      );
    });
  }, [customers, searchQuery]);

  return (
    <div className="fade-in admin-tab customers-tab">
      <div className="glass-panel shadow-gold admin-tab-shell">
        <div className="admin-tab-header">
          <div>
            <h2 className="brand-font admin-tab-title">Quản Lý Khách Hàng</h2>
            <p className="admin-tab-subtitle">
              Theo dõi danh sách khách hàng, doanh số, và tần suất mua hàng.
            </p>
          </div>
          <div className="admin-tab-actions">
            <input 
              type="text" 
              placeholder="🔍 Tìm khách hàng..." 
              className="luxury-input-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, minWidth: '200px' }}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="admin-table-loading" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
            Đang tải dữ liệu khách hàng...
          </div>
        ) : (
          <div className="table-container shadow-gold admin-table-shell">
            <table className="admin-table-modern">
              <thead className="admin-table-head">
                <tr>
                  <th className="admin-th">Tên Đăng Nhập</th>
                  <th className="admin-th">Họ Tên</th>
                  <th className="admin-th">Email</th>
                  <th className="admin-th">SĐT</th>
                  <th className="admin-th admin-th-right">Tổng Chi Tiêu</th>
                  <th className="admin-th admin-th-center">Số Đơn</th>
                  <th className="admin-th">Mua Hàng Lần Cuối</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((c) => {
                    const lastOrderDate = c.lastOrderDate 
                      ? new Date(c.lastOrderDate).toLocaleDateString('vi-VN')
                      : 'Chưa có';
                    const totalSpend = c.totalSpend || 0;

                    return (
                      <tr 
                        key={c.id} 
                        className="table-row-hover admin-tr"
                        onClick={() => setSelectedCustomer(c)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="admin-td"><strong>{c.username}</strong></td>
                        <td className="admin-td">{c.fullName || '—'}</td>
                        <td className="admin-td"><span style={{ fontSize: '0.85rem', color: '#888' }}>{c.email || '—'}</span></td>
                        <td className="admin-td"><span style={{ fontSize: '0.85rem', color: '#888' }}>{c.phoneNumber || '—'}</span></td>
                        <td className="admin-td admin-th-right">
                          <strong className="admin-amount">{vnd(totalSpend)}</strong>
                        </td>
                        <td className="admin-td admin-td-center">
                          <span style={{ background: '#222', padding: '0.3rem 0.7rem', borderRadius: '4px' }}>
                            {c.orderCount || 0}
                          </span>
                        </td>
                        <td className="admin-td" style={{ fontSize: '0.85rem', color: '#888' }}>
                          {lastOrderDate}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={7} className="admin-empty-cell">CHƯA CÓ KHÁCH HÀNG NÀO.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedCustomer && (
        <CustomerDetailModal 
          customer={selectedCustomer} 
          onClose={() => setSelectedCustomer(null)} 
        />
      )}
    </div>
  );
};

export default CustomersTab;
