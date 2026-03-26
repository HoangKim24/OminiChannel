import React, { useState } from 'react';
import './OrdersTable.css';

const OrdersTable = ({ orders }) => {
  const [openMenuId, setOpenMenuId] = useState(null);

  // Dữ liệu mẫu (có thể thay bằng props thật từ API)
  const defaultOrders = [
    { id: 'ORD-2601', customer: 'Nguyễn Minh Anh', date: '2026-03-25', channel: 'Web', total: 2450000, status: 'Completed' },
    { id: 'ORD-2602', customer: 'Trần Thị Hương', date: '2026-03-25', channel: 'Store', total: 1890000, status: 'Processing' },
    { id: 'ORD-2603', customer: 'Lê Văn Khoa', date: '2026-03-24', channel: 'Web', total: 5200000, status: 'Pending' },
    { id: 'ORD-2604', customer: 'Phạm Quốc Bảo', date: '2026-03-24', channel: 'Store', total: 980000, status: 'Cancelled' },
    { id: 'ORD-2605', customer: 'Hoàng Thu Trang', date: '2026-03-23', channel: 'Web', total: 3150000, status: 'Completed' },
    { id: 'ORD-2606', customer: 'Đỗ Thanh Sơn', date: '2026-03-23', channel: 'Web', total: 1720000, status: 'Processing' },
    { id: 'ORD-2607', customer: 'Vũ Ngọc Linh', date: '2026-03-22', channel: 'Store', total: 4600000, status: 'Pending' },
    { id: 'ORD-2608', customer: 'Bùi Đức Huy', date: '2026-03-22', channel: 'Web', total: 890000, status: 'Completed' },
  ];

  const data = orders || defaultOrders;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'badge-pending';
      case 'Processing': return 'badge-processing';
      case 'Completed': return 'badge-completed';
      case 'Cancelled': return 'badge-cancelled';
      default: return '';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Pending': return 'Chờ xử lý';
      case 'Processing': return 'Đang xử lý';
      case 'Completed': return 'Hoàn thành';
      case 'Cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const toggleMenu = (orderId) => {
    setOpenMenuId(openMenuId === orderId ? null : orderId);
  };

  return (
    <div className="ot-container">
      <div className="ot-header">
        <h2 className="ot-title">Đơn hàng gần đây</h2>
        <span className="ot-count">{data.length} đơn hàng</span>
      </div>
      
      <div className="ot-table-wrapper">
        <table className="ot-table">
          <thead>
            <tr>
              <th>Mã Đơn</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Kênh bán</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {data.map((order, index) => (
              <tr key={order.id}>
                <td className="ot-order-id">{order.id}</td>
                <td>
                  <div className="ot-customer">
                    <div className="ot-customer-avatar">
                      {order.customer.charAt(0)}
                    </div>
                    <span>{order.customer}</span>
                  </div>
                </td>
                <td className="ot-date">{formatDate(order.date)}</td>
                <td>
                  <span className={`ot-channel ${order.channel === 'Web' ? 'channel-web' : 'channel-store'}`}>
                    {order.channel}
                  </span>
                </td>
                <td className="ot-total">{formatCurrency(order.total)}</td>
                <td>
                  <span className={`ot-badge ${getStatusClass(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </td>
                <td>
                  <div className="ot-actions">
                    <button className="ot-action-btn" onClick={() => toggleMenu(order.id)}>
                      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <circle cx="12" cy="5" r="1.5"></circle>
                        <circle cx="12" cy="12" r="1.5"></circle>
                        <circle cx="12" cy="19" r="1.5"></circle>
                      </svg>
                    </button>
                    {openMenuId === order.id && (
                      <div className="ot-dropdown">
                        <button onClick={() => { setOpenMenuId(null); }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          Xem chi tiết
                        </button>
                        <button onClick={() => { setOpenMenuId(null); }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          Cập nhật
                        </button>
                        <button className="ot-dropdown-danger" onClick={() => { setOpenMenuId(null); }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          Hủy đơn
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;
