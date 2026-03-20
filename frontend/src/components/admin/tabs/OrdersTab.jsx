import React, { useState } from 'react';
import { vnd } from '../../../utils/format';

const OrdersTab = ({ orders, user, onRefresh }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const statuses = ['Pending', 'Confirmed', 'Shipping', 'Completed', 'Cancelled'];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#f39c12';
      case 'confirmed': return '#3498db';
      case 'shipping': return '#9b59b6';
      case 'completed': return '#27ae60';
      case 'cancelled': return '#e74c3c';
      default: return '#888';
    }
  };

  const openDetail = (order) => {
    setSelectedOrder(order);
    setShowDetail(true);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': user?.role || 'Admin'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // Update local state
        if (selectedOrder && (selectedOrder.id ?? selectedOrder.Id) === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus, Status: newStatus });
        }
        if (onRefresh) onRefresh();
      }
    } catch (err) { console.error('Update status error:', err); }
    finally { setUpdatingStatus(false); }
  };

  return (
    <div className="fade-in">
      <div className="glass-panel shadow-gold" style={{ border: 'none', background: 'transparent', padding: '0 0 2rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h2 className="brand-font" style={{ fontSize: '2rem', color: 'var(--admin-gold)' }}>Quản Lý Đơn Hàng</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', letterSpacing: '0.5px' }}>
              Theo dõi và xử lý các đơn hàng kiệt tác từ khách hàng thượng lưu.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <select className="luxury-input-field" style={{ minWidth: '180px' }}>
                <option>Lọc: Tất cả trạng thái</option>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
             <button className="luxury-input-field" style={{ minWidth: '120px' }}>LỌC NGÀY</button>
          </div>
        </div>
        
        <div className="table-container shadow-gold" style={{ background: 'rgba(10,10,10,0.5)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
          <table className="admin-table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'rgba(197, 160, 89, 0.05)', borderBottom: '1px solid var(--admin-border)' }}>
              <tr>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.65rem', color: 'var(--admin-gold)', textTransform: 'uppercase', letterSpacing: '2px' }}>Mã Đơn</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.65rem', color: 'var(--admin-gold)', textTransform: 'uppercase', letterSpacing: '2px' }}>Khách Hàng</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.65rem', color: 'var(--admin-gold)', textTransform: 'uppercase', letterSpacing: '2px' }}>Sản Phẩm</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.65rem', color: 'var(--admin-gold)', textTransform: 'uppercase', letterSpacing: '2px' }}>Tổng Tiền</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.65rem', color: 'var(--admin-gold)', textTransform: 'uppercase', letterSpacing: '2px' }}>Trạng Thái</th>
                <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.65rem', color: 'var(--admin-gold)', textTransform: 'uppercase', letterSpacing: '2px' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(orders) && orders.length > 0 ? (
                orders.map((o) => {
                  const id = o.id ?? o.Id;
                  const items = o.items || o.Items || [];
                  const firstItem = items[0];
                  const itemLabel = items.length ? `${firstItem.perfumeName || firstItem.PerfumeName || 'Sản phẩm'}${items.length > 1 ? ` +${items.length - 1}` : ''}` : '—';
                  const amount = o.totalAmount ?? o.TotalAmount ?? 0;
                  const currentStatus = o.status || o.Status || 'Pending';

                  return (
                    <tr key={id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.3s' }} className="table-row-hover">
                      <td style={{ padding: '1.25rem' }}><strong style={{ color: 'var(--admin-gold)', letterSpacing: '1px' }}>#{id}</strong></td>
                      <td style={{ padding: '1.25rem' }}>
                         <div style={{ color: '#fff', fontWeight: '600' }}>User #{o.userId ?? o.UserId}</div>
                         <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                           {o.orderDate ? new Date(o.orderDate).toLocaleDateString('vi-VN') : ''}
                         </div>
                      </td>
                      <td style={{ padding: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{itemLabel}</td>
                      <td style={{ padding: '1.25rem' }}><strong style={{ color: '#fff', fontSize: '0.95rem' }}>{vnd(amount)}</strong></td>
                      <td style={{ padding: '1.25rem' }}>
                         <span className="luxury-badge" style={{ color: getStatusColor(currentStatus), borderColor: getStatusColor(currentStatus) }}>
                            {currentStatus.toUpperCase()}
                         </span>
                      </td>
                      <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                        <button className="luxury-input-field" style={{ fontSize: '0.65rem', padding: '0.5rem 1rem' }} onClick={() => openDetail(o)}>
                          CHI TIẾT
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={6} style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '5rem' }}>CHƯA CÓ ĐƠN HÀNG NÀO CẦN XỬ LÝ.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDetail && selectedOrder && (() => {
        const orderId = selectedOrder.id ?? selectedOrder.Id;
        const currentStatus = selectedOrder.status || selectedOrder.Status || 'Pending';
        const address = selectedOrder.shippingAddress || selectedOrder.ShippingAddress || 'Chưa có';
        const phone = selectedOrder.receiverPhone || selectedOrder.ReceiverPhone || 'Chưa có';
        const note = selectedOrder.note || selectedOrder.Note || '';
        const orderDate = selectedOrder.orderDate || selectedOrder.OrderDate;

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
           <div className="glass-panel shadow-gold fade-in" style={{ width: '800px', maxWidth: '95vw', background: '#0a0a0a', border: '1px solid var(--admin-border)', padding: '3.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                 <h2 className="brand-font" style={{ fontSize: '1.8rem', color: 'var(--admin-gold)' }}>Chi Tiết Đơn Hàng #{orderId}</h2>
                 <button onClick={() => setShowDetail(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: '2rem', cursor: 'pointer' }}>×</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                 <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h4 style={{ color: 'var(--admin-gold)', textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '2px', marginBottom: '1rem' }}>👤 THÔNG TIN KHÁCH HÀNG</h4>
                    <p style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem' }}>User #{selectedOrder.userId ?? selectedOrder.UserId}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SĐT: {phone}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ngày: {orderDate ? new Date(orderDate).toLocaleString('vi-VN') : '—'}</p>
                 </div>
                 <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h4 style={{ color: 'var(--admin-gold)', textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '2px', marginBottom: '1rem' }}>🚚 THÔNG TIN GIAO HÀNG</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Địa chỉ: {address}</p>
                    {note && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Ghi chú: {note}</p>}
                    <div className="luxury-badge" style={{ color: getStatusColor(currentStatus), marginTop: '1rem', display: 'inline-block' }}>{currentStatus.toUpperCase()}</div>
                 </div>
              </div>

              {/* Status Update */}
              <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(197, 160, 89, 0.03)', border: '1px solid var(--admin-border)' }}>
                <h4 style={{ color: 'var(--admin-gold)', fontSize: '0.65rem', letterSpacing: '2px', marginBottom: '1rem', textTransform: 'uppercase' }}>CẬP NHẬT TRẠNG THÁI</h4>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {statuses.map(s => (
                    <button key={s} disabled={updatingStatus || s === currentStatus}
                      className="luxury-input-field"
                      style={{
                        fontSize: '0.65rem', padding: '0.5rem 1rem', cursor: s === currentStatus ? 'default' : 'pointer',
                        borderColor: s === currentStatus ? getStatusColor(s) : undefined,
                        color: s === currentStatus ? getStatusColor(s) : undefined,
                        opacity: s === currentStatus ? 0.5 : 1
                      }}
                      onClick={() => handleUpdateStatus(orderId, s)}>
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <h4 className="brand-font" style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>🛍️ DANH SÁCH SẢN PHẨM</h4>
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--admin-border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--admin-border)' }}>
                      <tr>
                         <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.6rem', color: 'var(--admin-gold)', letterSpacing: '1px' }}>SẢN PHẨM</th>
                         <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.6rem', color: 'var(--admin-gold)', letterSpacing: '1px' }}>SL</th>
                         <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.6rem', color: 'var(--admin-gold)', letterSpacing: '1px' }}>GIÁ NIÊM YẾT</th>
                         <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.6rem', color: 'var(--admin-gold)', letterSpacing: '1px' }}>THÀNH TIỀN</th>
                      </tr>
                   </thead>
                   <tbody>
                      {(selectedOrder.items || selectedOrder.Items || []).map((it, idx) => (
                         <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{it.perfumeName || it.PerfumeName}</td>
                            <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>x{it.quantity || it.Quantity}</td>
                            <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.85rem' }}>{vnd(it.price || it.Price)}</td>
                            <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.85rem', fontWeight: '700' }}>{vnd((it.price || it.Price) * (it.quantity || it.Quantity))}</td>
                         </tr>
                      ))}
                   </tbody>
                   <tfoot>
                      <tr style={{ background: 'rgba(197, 160, 89, 0.03)' }}>
                         <td colSpan={3} style={{ textAlign: 'right', padding: '1.5rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>GIÁ TRỊ ĐƠN HÀNG:</td>
                         <td style={{ textAlign: 'right', padding: '1.5rem', color: 'var(--admin-gold)', fontSize: '1.2rem', fontWeight: '900' }}>{vnd(selectedOrder.totalAmount ?? selectedOrder.TotalAmount)}</td>
                      </tr>
                   </tfoot>
                </table>
              </div>

              <div style={{ marginTop: '3.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1.5rem' }}>
                 <button className="luxury-button-gold" onClick={() => setShowDetail(false)}>ĐÓNG CHI TIẾT</button>
              </div>
           </div>
          </div>
        );
      })()}
    </div>
  );
};

export default OrdersTab;
