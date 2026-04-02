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

  const statuses = [
    { value: 'Pending', label: 'Chờ xác nhận' },
    { value: 'Confirmed', label: 'Đã xác nhận' },
    { value: 'Shipping', label: 'Đang giao' },
    { value: 'Completed', label: 'Hoàn thành' },
    { value: 'Cancelled', label: 'Đã hủy' },
  ];

  const statusLabelMap = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
  };

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

  const getStatusLabel = (status) => statusLabelMap[String(status || '').trim().toLowerCase()] || 'Chưa xác định';

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
        success(`✓ Cập nhật trạng thái thành "${getStatusLabel(newStatus)}" thành công!`);
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
      const currentStatus = String(o.status || o.Status || '').trim().toLowerCase();
      const statusMatches = filterStatus === 'all' || currentStatus === filterStatus.toLowerCase();
      return searchMatches && statusMatches;
    });
  }, [orders, searchQuery, filterStatus]);

  return (
    <div className="fade-in admin-tab orders-tab">
      <div className="glass-panel shadow-gold admin-tab-shell">
        <div className="admin-tab-header">
          <div>
            <h2 className="brand-font admin-tab-title">Quản lý đơn hàng</h2>
            <p className="admin-tab-subtitle">
              Theo dõi, xem chi tiết và xử lý đơn hàng của khách hàng.
            </p>
          </div>
          <div className="admin-tab-actions">
             <input 
               type="text" 
               placeholder="🔍 Tìm mã đơn hàng..." 
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
               {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
             </select>
          </div>
        </div>
        
        <div className="table-container shadow-gold admin-table-shell">
          <table className="admin-table-modern">
            <thead className="admin-table-head">
              <tr>
                <th className="admin-th">Mã đơn</th>
                <th className="admin-th">Khách hàng</th>
                <th className="admin-th">Sản phẩm</th>
                <th className="admin-th">Tổng tiền</th>
                <th className="admin-th">Trạng thái</th>
                <th className="admin-th admin-th-center">Thao tác</th>
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
                         <div className="admin-user-cell">Khách hàng #{o.userId ?? o.UserId}</div>
                         <div className="admin-cell-sub">
                           {o.orderDate ? new Date(o.orderDate).toLocaleDateString('vi-VN') : ''}
                         </div>
                      </td>
                      <td className="admin-td admin-cell-text">{itemLabel}</td>
                      <td className="admin-td"><strong className="admin-amount">{vnd(amount)}</strong></td>
                      <td className="admin-td">
                         <span className={`luxury-badge ${getStatusClass(currentStatus)}`}>
                            {getStatusLabel(currentStatus)}
                         </span>
                      </td>
                      <td className="admin-td admin-td-center">
                        <button className="luxury-input-field admin-mini-btn" onClick={() => openDetail(o)}>
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={6} className="admin-empty-cell">Chưa có đơn hàng nào cần xử lý.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDetail && selectedOrder && (() => {
        const orderId = selectedOrder.id ?? selectedOrder.Id;
        const currentStatus = selectedOrder.status || selectedOrder.Status || 'Pending';
        const currentStatusLabel = getStatusLabel(currentStatus);
        const address = selectedOrder.shippingAddress || selectedOrder.ShippingAddress || 'Chưa có';
        const phone = selectedOrder.receiverPhone || selectedOrder.ReceiverPhone || 'Chưa có';
        const note = selectedOrder.note || selectedOrder.Note || '';
        const orderDate = selectedOrder.orderDate || selectedOrder.OrderDate;

        return (
           <div className="admin-modal-overlay">
            <div className="glass-panel shadow-gold fade-in admin-centered-modal">
              <div className="admin-modal-head">
                <h2 className="brand-font admin-modal-title">Chi tiết đơn hàng #{orderId}</h2>
                <button className="admin-modal-close" onClick={() => setShowDetail(false)}>×</button>
              </div>

              <div className="admin-form-grid-2 admin-detail-grid">
                <div className="admin-modal-subpanel">
                      <h4 className="admin-info-label">👤 Thông tin khách hàng</h4>
                      <p className="admin-info-user">Khách hàng #{selectedOrder.userId ?? selectedOrder.UserId}</p>
                      <p className="admin-info-line">SĐT: {phone}</p>
                      <p className="admin-info-line">Ngày đặt: {orderDate ? new Date(orderDate).toLocaleString('vi-VN') : '—'}</p>
                 </div>
                 <div className="admin-modal-subpanel">
                      <h4 className="admin-info-label">🚚 Thông tin giao hàng</h4>
                      <p className="admin-info-address">Địa chỉ: {address}</p>
                      {note && <p className="admin-info-line">Ghi chú: {note}</p>}
                    <div className={`luxury-badge ${getStatusClass(currentStatus)}`} style={{ marginTop: '1rem', display: 'inline-block' }}>{currentStatusLabel}</div>
                 </div>
              </div>

              {/* Status Update */}
              <div className="admin-modal-subpanel admin-status-panel">
                <h4 className="admin-info-label">Cập nhật trạng thái</h4>
                <div className="admin-status-actions">
                  {statuses.map((s) => (
                    <button key={s.value} disabled={updatingStatus || s.value === currentStatus}
                      className={`luxury-input-field admin-mini-btn ${getStatusClass(s.value)}`}
                      style={{
                        cursor: s.value === currentStatus ? 'default' : 'pointer',
                        opacity: s.value === currentStatus ? 0.5 : 1
                      }}
                      onClick={() => handleUpdateStatus(orderId, s.value)}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

                <h4 className="brand-font admin-order-items-title">🛍️ Danh sách sản phẩm</h4>
              <div className="admin-order-items-table">
                 <table className="admin-items-table">
                   <thead className="admin-items-head">
                      <tr>
                       <th className="admin-items-th">Sản phẩm</th>
                       <th className="admin-items-th admin-items-th-center">Số lượng</th>
                       <th className="admin-items-th admin-items-th-right">Giá niêm yết</th>
                       <th className="admin-items-th admin-items-th-right">Thành tiền</th>
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
                       <td colSpan={3} className="admin-items-total-label">Giá trị đơn hàng:</td>
                       <td className="admin-items-total-value">{vnd(selectedOrder.totalAmount ?? selectedOrder.TotalAmount)}</td>
                      </tr>
                   </tfoot>
                </table>
              </div>

                <div className="admin-modal-actions admin-modal-actions-end">
                 <button className="luxury-button-gold" onClick={() => setShowDetail(false)}>Đóng chi tiết</button>
              </div>
           </div>
          </div>
        );
      })()}
    </div>
  );
};

export default OrdersTab;

