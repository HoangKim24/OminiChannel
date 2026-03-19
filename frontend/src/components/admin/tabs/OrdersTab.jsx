import React, { useState } from 'react';
import { vnd } from '../../../utils/format';

const OrdersTab = ({ orders }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

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

  return (
    <div className="fade-in">
      <div className="admin-panel glass shadow-lg">
        <div className="admin-tab-header">
          <h3 className="brand-font page-title">📜 Quản Lý Đơn Hàng</h3>
          <div className="admin-filters">
             <select className="admin-input-sm">
                <option>Lọc: Tất cả trạng thái</option>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
             <button className="admin-input-sm filter-btn">📅 Lọc Ngày</button>
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="admin-table admin-table-modern">
            <thead>
              <tr>
                <th>Mã Đơn</th>
                <th>Khách Hàng</th>
                <th>Sản Phẩm</th>
                <th>Tổng Tiền</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(orders) && orders.length > 0 ? (
                orders.map((o) => {
                  const id = o.id ?? o.Id;
                  const customer = o.customerName ?? o.CustomerName ?? o.userName ?? o.UserName ?? 'Khách hàng';
                  const items = o.items || o.Items || [];
                  const firstItem = items[0];
                  const itemLabel = items.length ? `${firstItem.perfumeName || firstItem.PerfumeName || 'Sản phẩm'}${items.length > 1 ? ` +${items.length - 1}` : ''}` : '—';
                  const amount = o.totalAmount ?? o.TotalAmount ?? (Array.isArray(items) ? items.reduce((s, it) => s + (it.price || it.Price || 0) * (it.quantity || it.Quantity || 1), 0) : 0);
                  const currentStatus = o.status || o.Status || 'Pending';

                  return (
                    <tr key={id}>
                      <td><strong>#{id}</strong></td>
                      <td>
                         <div>{customer}</div>
                         <div style={{ fontSize: '0.7rem', color: '#888' }}>2 phút trước</div>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{itemLabel}</td>
                      <td><strong style={{ color: 'var(--luxury-gold)' }}>{vnd(amount)}</strong></td>
                      <td>
                         <select 
                            className="admin-input-sm" 
                            style={{ color: getStatusColor(currentStatus), borderColor: getStatusColor(currentStatus), background: 'transparent', fontSize: '0.75rem', padding: '0.3rem' }}
                            defaultValue={currentStatus}
                            onChange={(e) => alert(`Cập nhật trạng thái đơn #${id} thành ${e.target.value}`)}
                         >
                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                         </select>
                      </td>
                      <td>
                        <button className="btn-action-view" onClick={() => openDetail(o)}>
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={6} style={{ color: '#888', fontSize: '0.9rem', textAlign: 'center', padding: '3rem' }}>Chưa có đơn hàng nào cần xử lý.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showDetail && selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
           <div className="fade-in admin-panel shadow-gold" style={{ width: '800px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', background: '#0a0a0a', border: '1px solid var(--luxury-gold)', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                 <h2 className="brand-font" style={{ fontSize: '1.5rem' }}>Chi Tiết Đơn Hàng #{selectedOrder.id ?? selectedOrder.Id}</h2>
                 <button onClick={() => setShowDetail(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
              </div>

              <div className="dashboard-row" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
                 <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', flex: 1 }}>
                    <h4 style={{ color: 'var(--luxury-gold)', textTransform: 'uppercase', fontSize: '0.7rem', marginBottom: '0.8rem' }}>👤 Thông khách</h4>
                    <p><strong>{selectedOrder.customerName ?? selectedOrder.UserName}</strong></p>
                    <p style={{ fontSize: '0.85rem', color: '#888' }}>Số ĐT: 090xxxx888</p>
                 </div>
                 <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', flex: 1 }}>
                    <h4 style={{ color: 'var(--luxury-gold)', textTransform: 'uppercase', fontSize: '0.7rem', marginBottom: '0.8rem' }}>🚚 Vận chuyển</h4>
                    <p style={{ fontSize: '0.85rem' }}>Đơn vị: GHTK</p>
                    <p style={{ fontSize: '0.8rem', color: '#555' }}>ID: GHTK-9821...</p>
                 </div>
              </div>

              <h4 className="brand-font" style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>🛍️ Sản phẩm</h4>
              <div className="table-responsive">
                <table className="admin-table">
                   <thead style={{ background: '#111' }}>
                      <tr>
                         <th>Sản phẩm</th>
                         <th>SL</th>
                         <th>Giá</th>
                         <th style={{ textAlign: 'right' }}>Thành tiền</th>
                      </tr>
                   </thead>
                   <tbody>
                      {(selectedOrder.items || selectedOrder.Items || []).map((it, idx) => (
                         <tr key={idx}>
                            <td>{it.perfumeName || it.PerfumeName}</td>
                            <td>x{it.quantity || it.Quantity}</td>
                            <td>{vnd(it.price || it.Price)}</td>
                            <td style={{ textAlign: 'right' }}>{vnd((it.price || it.Price) * (it.quantity || it.Quantity))}</td>
                         </tr>
                      ))}
                   </tbody>
                   <tfoot>
                      <tr>
                         <td colSpan={3} style={{ textAlign: 'right', padding: '1rem', fontStyle: 'italic', color: '#666', fontSize: '0.85rem' }}>Tổng cộng:</td>
                         <td style={{ textAlign: 'right', color: 'var(--luxury-gold)', fontWeight: 'bold' }}>{vnd(selectedOrder.totalAmount ?? selectedOrder.TotalAmount)}</td>
                      </tr>
                   </tfoot>
                </table>
              </div>

              <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                 <button className="admin-input-sm">In Hóa Đơn</button>
                 <button className="btn-gold" style={{ padding: '0.8rem 1.5rem' }} onClick={() => setShowDetail(false)}>Đóng</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
