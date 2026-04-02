import { useEffect, useState } from 'react';
import { vnd } from '../../../utils/format';

const CustomerDetailModal = ({ customer, onClose }) => {
  const [customerOrders, setCustomerOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    if (customer?.id) {
      const fetchOrders = async () => {
        try {
          setIsLoadingOrders(true);
          const res = await fetch(`/api/orders/user/${customer.id}`);
          if (res.ok) {
            const data = await res.json();
            setCustomerOrders(Array.isArray(data) ? data : []);
          }
        } catch (err) {
          console.error('Failed to fetch customer orders:', err);
        } finally {
          setIsLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [customer?.id]);

  if (!customer) return null;

  const totalSpend = customer.totalSpend || 0;
  const orderCount = customer.orderCount || 0;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="glass-panel shadow-gold fade-in admin-detail-modal" onClick={e => e.stopPropagation()}>
        {/* Close Button */}
        <button 
          className="admin-modal-close" 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#888' }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #333' }}>
          <h2 className="brand-font" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{customer.fullName || customer.username}</h2>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>@{customer.username}</p>
        </div>

        {/* Contact Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>THÔNG TIN LIÊN HỆ</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>Email:</span>
                <p style={{ margin: '0.25rem 0 0 0' }}>{customer.email || '—'}</p>
              </div>
              <div>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>Số Điện Thoại:</span>
                <p style={{ margin: '0.25rem 0 0 0' }}>{customer.phoneNumber || '—'}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div>
            <h3 style={{ fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>THỐNG KÊ MUA HÀNG</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>Tổng Chi Tiêu:</span>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.2rem', color: 'var(--accent-gold)', fontWeight: '600' }}>{vnd(totalSpend)}</p>
              </div>
              <div>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>Số Đơn Hàng:</span>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.1rem' }}>{orderCount}</p>
              </div>
              <div>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>Mua Hàng Lần Cuối:</span>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                  {customer.lastOrderDate 
                    ? new Date(customer.lastOrderDate).toLocaleDateString('vi-VN') 
                    : 'Chưa có'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>LỊCH SỬ ĐƠN HÀNG ({customerOrders.length})</h3>
          
          {isLoadingOrders ? (
            <p style={{ textAlign: 'center', color: '#666' }}>Đang tải lịch sử đơn hàng...</p>
          ) : customerOrders.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>Chưa có đơn hàng nào.</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
              {customerOrders.map(order => {
                const items = order.items || order.Items || [];
                const total = order.totalAmount ?? order.TotalAmount ?? 0;
                const status = order.status || order.Status || 'Chờ xác nhận';
                
                return (
                  <div 
                    key={order.id} 
                    style={{
                      padding: '1rem',
                      background: '#111',
                      border: '1px solid #222',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: '600' }}>Đơn #{order.id}</span>
                      <span style={{ 
                        color: 'var(--accent-gold)', 
                        fontSize: '0.8rem', 
                        background: '#222',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px'
                      }}>
                        {status}
                      </span>
                    </div>
                    <p style={{ color: '#888', fontSize: '0.85rem', margin: '0.3rem 0' }}>
                      {order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                    <p style={{ color: 'var(--accent-gold)', fontWeight: '600', margin: '0.5rem 0' }}>
                      {vnd(total)}
                    </p>
                    {items.length > 0 && (
                      <ul style={{ listStyle: 'none', padding: '0.5rem 0 0 0', color: '#aaa', fontSize: '0.8rem' }}>
                        {items.slice(0, 2).map((item, i) => (
                          <li key={i}>• {item.perfumeName || item.PerfumeName} x{item.quantity || item.Quantity}</li>
                        ))}
                        {items.length > 2 && <li style={{ color: '#666', marginTop: '0.3rem' }}>... +{items.length - 2} sản phẩm</li>}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #333' }}>
          <button 
            className="luxury-button-gold"
            style={{ flex: 1 }}
            onClick={onClose}
          >
            ĐÓNG
          </button>
          <button 
            style={{ 
              flex: 1,
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: '1px solid var(--accent-gold)',
              color: 'var(--accent-gold)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={e => { e.target.style.background = 'rgba(173, 142, 71, 0.1)' }}
            onMouseLeave={e => { e.target.style.background = 'transparent' }}
          >
            GỬI TIN NHẮN
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailModal;
