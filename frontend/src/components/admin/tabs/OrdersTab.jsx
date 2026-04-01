import { useState, useMemo } from 'react';
import { vnd } from '../../../utils/format';
import { useToast } from '../../../utils/toastContext.jsx';

const OrdersTab = ({ orders, user, onRefresh }) => {
  const { success, error } = useToast();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const statuses = ['Pending', 'Confirmed', 'Shipping', 'Completed', 'Cancelled'];

  const getStatusClass = (status) => {
    const normalized = status?.toLowerCase() || 'default';
    const classMap = {
      'pending': 'order-status-pending',
      'confirmed': 'order-status-confirmed',
      'shipping': 'order-status-shipping',
      'completed': 'order-status-completed',
      'cancelled': 'order-status-cancelled'
    };
    return classMap[normalized] || 'order-status-default';
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
        success(`✓ Cập nhật trạng thái thành "${newStatus}" thành công!`);
        // Update local state
        if (selectedOrder && (selectedOrder.id ?? selectedOrder.Id) === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus, Status: newStatus });
        }
        if (onRefresh) onRefresh();
      } else {
        error('Lỗi khi cập nhật trạng thái đơn hàng');
      }
    } catch (err) { error('Lỗi kết nối: ' + err.message); }
    finally { setUpdatingStatus(false); }
  };

  const filteredOrders = useMemo(() => {
    return (Array.isArray(orders) ? orders : []).filter(o => {
      const orderId = o.id ?? o.Id;
      const searchMatches = searchQuery === '' || String(orderId).includes(searchQuery);
      const statusMatches = filterStatus === 'all' || (o.status || o.Status) === filterStatus;
      return searchMatches && statusMatches;
    });
  }, [orders, searchQuery, filterStatus]);

  return (
    <div className="fade-in admin-tab orders-tab">
      <div className="glass-panel shadow-gold admin-tab-shell">
        <div className="admin-tab-header">
          <div>
            <h2 className="brand-font admin-tab-title">Quản Lý Đơn Hàng</h2>
            <p className="admin-tab-subtitle">
              Theo dõi và xử lý các đơn hàng kiệt tác từ khách hàng thượng lưu.
            </p>
          </div>
          <div className="admin-tab-actions">
             <input 
               type="text" 
               placeholder="🔍 Tìm mã đơn..." 
               className="luxury-input-field"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               style={{ flex: 1, minWidth: '150px' }}
             />
             <select 
               className="luxury-input-field"
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
             >
               <option value="all">Tất cả trạng thái</option>
               {statuses.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
          </div>
        </div>
        
        <div className="table-container shadow-gold admin-table-shell">
          <table className="admin-table-modern">
            <thead className="admin-table-head">
              <tr>
                <th className="admin-th">Mã Đơn</th>
                <th className="admin-th">Khách Hàng</th>
                <th className="admin-th">Sản Phẩm</th>
                <th className="admin-th">Tổng Tiền</th>
                <th className="admin-th">Trạng Thái</th>
                <th className="admin-th admin-th-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((o) => {
                  const id = o.id ?? o.Id;
                  const items = o.items || o.Items || [];
                  const firstItem = items[0];
                  const itemLabel = items.length ? `${firstItem.perfumeName || firstItem.PerfumeName || 'Sản phẩm'}${items.length > 1 ? ` +${items.length - 1}` : ''}` : '—';
                  const amount = o.totalAmount ?? o.TotalAmount ?? 0;
                  const currentStatus = o.status || o.Status || 'Pending';

                  return (
                    <tr key={id} className="table-row-hover admin-tr">
                      <td className="admin-td"><strong className="admin-order-code">#{id}</strong></td>
                      <td className="admin-td">
                         <div className="admin-user-cell">User #{o.userId ?? o.UserId}</div>
                         <div className="admin-cell-sub">
                           {o.orderDate ? new Date(o.orderDate).toLocaleDateString('vi-VN') : ''}
                         </div>
                      </td>
                      <td className="admin-td admin-cell-text">{itemLabel}</td>
                      <td className="admin-td"><strong className="admin-amount">{vnd(amount)}</strong></td>
                      <td className="admin-td">
                         <span className={`luxury-badge ${getStatusClass(currentStatus)}`}>
                            {currentStatus.toUpperCase()}
                         </span>
                      </td>
                      <td className="admin-td admin-td-center">
                        <button className="luxury-input-field admin-mini-btn" onClick={() => openDetail(o)}>
                          CHI TIẾT
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={6} className="admin-empty-cell">CHƯA CÓ ĐƠN HÀNG NÀO CẦN XỬ LÝ.</td></tr>
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
           <div className="admin-modal-overlay">
            <div className="glass-panel shadow-gold fade-in admin-centered-modal">
              <div className="admin-modal-head">
                <h2 className="brand-font admin-modal-title">Chi Tiết Đơn Hàng #{orderId}</h2>
                <button className="admin-modal-close" onClick={() => setShowDetail(false)}>×</button>
              </div>

              <div className="admin-form-grid-2 admin-detail-grid">
                <div className="admin-modal-subpanel">
                      <h4 className="admin-info-label">👤 THÔNG TIN KHÁCH HÀNG</h4>
                      <p className="admin-info-user">User #{selectedOrder.userId ?? selectedOrder.UserId}</p>
                      <p className="admin-info-line">SĐT: {phone}</p>
                      <p className="admin-info-line">Ngày: {orderDate ? new Date(orderDate).toLocaleString('vi-VN') : '—'}</p>
                 </div>
                 <div className="admin-modal-subpanel">
                      <h4 className="admin-info-label">🚚 THÔNG TIN GIAO HÀNG</h4>
                      <p className="admin-info-address">Địa chỉ: {address}</p>
                      {note && <p className="admin-info-line">Ghi chú: {note}</p>}
                    <div className={`luxury-badge ${getStatusClass(currentStatus)}`} style={{ marginTop: '1rem', display: 'inline-block' }}>{currentStatus.toUpperCase()}</div>
                 </div>
              </div>

              {/* Status Update */}
              <div className="admin-modal-subpanel admin-status-panel">
                <h4 className="admin-info-label">CẬP NHẬT TRẠNG THÁI</h4>
                <div className="admin-status-actions">
                  {statuses.map(s => (
                    <button key={s} disabled={updatingStatus || s === currentStatus}
                      className={`luxury-input-field admin-mini-btn ${getStatusClass(s)}`}
                      style={{
                        cursor: s === currentStatus ? 'default' : 'pointer',
                        opacity: s === currentStatus ? 0.5 : 1
                      }}
                      onClick={() => handleUpdateStatus(orderId, s)}>
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

                <h4 className="brand-font admin-order-items-title">🛍️ DANH SÁCH SẢN PHẨM</h4>
              <div className="admin-order-items-table">
                 <table className="admin-items-table">
                   <thead className="admin-items-head">
                      <tr>
                       <th className="admin-items-th">SẢN PHẨM</th>
                       <th className="admin-items-th admin-items-th-center">SL</th>
                       <th className="admin-items-th admin-items-th-right">GIÁ NIÊM YẾT</th>
                       <th className="admin-items-th admin-items-th-right">THÀNH TIỀN</th>
                      </tr>
                   </thead>
                   <tbody>
                      {(selectedOrder.items || selectedOrder.Items || []).map((it, idx) => (
                       <tr key={idx} className="admin-items-row">
                         <td className="admin-items-td">{it.perfumeName || it.PerfumeName}</td>
                         <td className="admin-items-td admin-items-td-center">x{it.quantity || it.Quantity}</td>
                         <td className="admin-items-td admin-items-td-right">{vnd(it.price || it.Price)}</td>
                         <td className="admin-items-td admin-items-td-right admin-items-td-strong">{vnd((it.price || it.Price) * (it.quantity || it.Quantity))}</td>
                         </tr>
                      ))}
                   </tbody>
                   <tfoot>
                     <tr className="admin-items-foot">
                       <td colSpan={3} className="admin-items-total-label">GIÁ TRỊ ĐƠN HÀNG:</td>
                       <td className="admin-items-total-value">{vnd(selectedOrder.totalAmount ?? selectedOrder.TotalAmount)}</td>
                      </tr>
                   </tfoot>
                </table>
              </div>

                <div className="admin-modal-actions admin-modal-actions-end">
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

