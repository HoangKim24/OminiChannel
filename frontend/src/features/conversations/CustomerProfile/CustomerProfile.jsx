import { Badge } from '../../../components/ui/Badge';
import './CustomerProfile.css';

export const CustomerProfile = ({ customer }) => {
  if (!customer) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Chọn một khách hàng</div>;
  }

  return (
    <div className="omni-conv-profile">
      <div className="omni-conv-profile__header">
        <div className="omni-conv-profile__avatar-lg">
          {customer.name.charAt(0)}
        </div>
        <h3 style={{ margin: 0 }}>{customer.name}</h3>
        <Badge variant={customer.channel === 'Facebook' ? 'info' : 'success'}>
          Trực tuyến
        </Badge>
      </div>

      <div className="omni-conv-profile__section">
        <h4 className="omni-conv-profile__title">Thông tin liên hệ</h4>
        <div className="omni-conv-profile__row">
          <span className="omni-conv-profile__label">Số điện thoại</span>
          <span className="omni-conv-profile__value">090 123 4567</span>
        </div>
        <div className="omni-conv-profile__row">
          <span className="omni-conv-profile__label">Email</span>
          <span className="omni-conv-profile__value">khachhang@gmail.com</span>
        </div>
        <div className="omni-conv-profile__row">
          <span className="omni-conv-profile__label">Kênh chat</span>
          <span className="omni-conv-profile__value">{customer.channel}</span>
        </div>
      </div>

      <div className="omni-conv-profile__section">
        <h4 className="omni-conv-profile__title">Đơn hàng gần đây</h4>
        <div className="omni-conv-profile__row">
          <span className="omni-conv-profile__label">#ORD-1029</span>
          <span className="omni-conv-profile__value" style={{ color: 'var(--status-success)' }}>Hoàn thành</span>
        </div>
        <div className="omni-conv-profile__row">
          <span className="omni-conv-profile__label">#ORD-0988</span>
          <span className="omni-conv-profile__value" style={{ color: 'var(--status-success)' }}>Hoàn thành</span>
        </div>
      </div>

      <div className="omni-conv-profile__section">
        <h4 className="omni-conv-profile__title">Phân khúc</h4>
        <Badge variant="gold">Khách hàng VIP</Badge>
      </div>
    </div>
  );
};
