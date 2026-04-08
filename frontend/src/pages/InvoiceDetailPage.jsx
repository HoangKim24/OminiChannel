import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useToast } from '../utils/useToast.jsx';
import './InvoiceDetailPage.css';

const vnd = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price || 0));

const normalizeOrderItem = (item) => ({
  id: item?.id ?? item?.Id,
  perfumeId: item?.perfumeId ?? item?.PerfumeId,
  perfumeName: item?.perfumeName ?? item?.PerfumeName ?? 'Sản phẩm',
  quantity: Number(item?.quantity ?? item?.Quantity ?? 0),
  price: Number(item?.price ?? item?.Price ?? 0),
});

const normalizeOrder = (order) => ({
  id: order?.id ?? order?.Id,
  userId: order?.userId ?? order?.UserId,
  orderDate: order?.orderDate ?? order?.OrderDate,
  totalAmount: Number(order?.totalAmount ?? order?.TotalAmount ?? 0),
  status: order?.status ?? order?.Status ?? 'Pending',
  shippingAddress: order?.shippingAddress ?? order?.ShippingAddress ?? '',
  receiverPhone: order?.receiverPhone ?? order?.ReceiverPhone ?? '',
  note: order?.note ?? order?.Note ?? '',
  isPickup: order?.isPickup ?? order?.IsPickup ?? false,
  voucherCode: order?.voucherCode ?? order?.VoucherCode ?? '',
  discountAmount: Number(order?.discountAmount ?? order?.DiscountAmount ?? 0),
  items: (() => {
    const rawItems = order?.items ?? order?.Items;
    return Array.isArray(rawItems) ? rawItems.map(normalizeOrderItem) : [];
  })(),
});

const getOrderStatusLabel = (status) => {
  const value = String(status || 'Pending').trim().toLowerCase();
  if (value === 'confirmed') return 'Đã xác nhận';
  if (value === 'shipping') return 'Đang giao';
  if (value === 'completed') return 'Đã hoàn tất';
  if (value === 'cancelled') return 'Đã hủy';
  return 'Chờ xác nhận';
};

const getCurrentStepIndex = (status) => {
  const value = String(status || 'pending').trim().toLowerCase();

  if (value === 'completed') return 4;
  if (value === 'shipping') return 3;
  if (value === 'confirmed') return 1;
  if (value === 'pending') return 0;
  if (value === 'cancelled') return 0;

  const numericValue = Number(value);
  if (Number.isFinite(numericValue)) {
    return Math.min(4, Math.max(0, numericValue));
  }

  return 0;
};

const STEPPER_STEPS = [
  'Đơn Hàng Đã Đặt',
  'Đã Xác Nhận',
  'Chờ Lấy Hàng',
  'Đang Giao',
  'Đánh Giá',
];

const InvoiceDetailPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { error } = useToast();

  const storedUser = useAppStore((state) => state.user);
  const orders = useAppStore((state) => state.orders);
  const loadingOrders = useAppStore((state) => state.loadingOrders);
  const fetchOrders = useAppStore((state) => state.fetchOrders);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storedUser) {
      navigate('/');
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        await fetchOrders();
      } catch (fetchError) {
        error(fetchError.message || 'Không tải được hóa đơn');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [error, fetchOrders, navigate, storedUser]);

  const normalizedOrders = useMemo(() => {
    return (Array.isArray(orders) ? orders : [])
      .map(normalizeOrder)
      .sort((a, b) => new Date(b.orderDate || 0) - new Date(a.orderDate || 0));
  }, [orders]);

  const selectedOrder = useMemo(() => {
    const orderId = params.orderId;
    if (!orderId || orderId === 'latest') {
      return normalizedOrders[0] || null;
    }

    const numericOrderId = Number(orderId);
    return normalizedOrders.find((order) => Number(order.id) === numericOrderId) || null;
  }, [normalizedOrders, params.orderId]);

  const orderStatus = getOrderStatusLabel(selectedOrder?.status);
  const currentStepIndex = getCurrentStepIndex(selectedOrder?.status);

  if (!storedUser) return null;

  return (
    <div className="invoice-page">
      <section className="invoice-hero admin-panel shadow-gold">
        <div>
          <p className="invoice-eyebrow">Hóa đơn của bạn</p>
          <h1 className="invoice-title">
            {selectedOrder ? `#${selectedOrder.id}` : 'Không tìm thấy hóa đơn'}
          </h1>
          <p className="invoice-subtitle">
            Xem trạng thái xác nhận, tình trạng giao hàng, sản phẩm bên trong đơn và thông tin thanh toán của bạn.
          </p>
        </div>
        <div className="invoice-hero-actions">
          <button type="button" className="invoice-back-btn" onClick={() => navigate('/profile')}>
            ← Quay lại hồ sơ
          </button>
          <Link to="/" className="invoice-link-btn">Về trang chủ</Link>
        </div>
      </section>

      {loading || loadingOrders ? (
        <div className="invoice-loading admin-panel">Đang tải hóa đơn...</div>
      ) : !selectedOrder ? (
        <div className="invoice-empty admin-panel">
          <h2>Không tìm thấy hóa đơn</h2>
          <p>Hóa đơn bạn chọn không tồn tại hoặc chưa thuộc tài khoản hiện tại.</p>
          <button type="button" className="invoice-back-btn" onClick={() => navigate('/profile')}>
            ← Xem danh sách đơn hàng
          </button>
        </div>
      ) : (
        <section className="invoice-layout">
          <article className="invoice-card admin-panel shadow-gold">
            <div className="invoice-card-head">
              <div>
                <span className={`invoice-status invoice-status-${String(selectedOrder.status || 'pending').toLowerCase()}`}>
                  {orderStatus}
                </span>
                <h2>Thông tin hóa đơn</h2>
              </div>
              <strong className="invoice-total">{vnd(selectedOrder.totalAmount)}</strong>
            </div>

            <div className="invoice-grid">
              <div>
                <span>Mã hóa đơn</span>
                <strong>#{selectedOrder.id}</strong>
              </div>
              <div>
                <span>Ngày đặt</span>
                <strong>{selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleString('vi-VN') : 'Chưa xác định'}</strong>
              </div>
              <div>
                <span>Hình thức nhận</span>
                <strong>{selectedOrder.isPickup ? 'Nhận tại cửa hàng' : 'Giao hàng'}</strong>
              </div>
              <div>
                <span>Số điện thoại</span>
                <strong>{selectedOrder.receiverPhone || 'Chưa cập nhật'}</strong>
              </div>
              <div>
                <span>Giảm giá</span>
                <strong>{vnd(selectedOrder.discountAmount)}</strong>
              </div>
              <div>
                <span>Mã voucher</span>
                <strong>{selectedOrder.voucherCode || 'Không có'}</strong>
              </div>
            </div>

            <div className="invoice-address">
              <span>Địa chỉ giao hàng</span>
              <strong>{selectedOrder.shippingAddress || 'Chưa cập nhật'}</strong>
            </div>

            {selectedOrder.note && (
              <div className="invoice-note">
                <span>Ghi chú</span>
                <strong>{selectedOrder.note}</strong>
              </div>
            )}
          </article>

          <article className="invoice-card admin-panel shadow-gold">
            <h2>Chi tiết sản phẩm</h2>
            <div className="invoice-items">
              {selectedOrder.items.map((item) => (
                <div key={item.id ?? `${item.perfumeId}-${item.perfumeName}`} className="invoice-item-row">
                  <div>
                    <strong>{item.perfumeName}</strong>
                    <p>Số lượng: {item.quantity}</p>
                  </div>
                  <div className="invoice-item-price">
                    <strong>{vnd(item.price * item.quantity)}</strong>
                    <p>{vnd(item.price)} / sp</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="invoice-card admin-panel shadow-gold">
            <h2>Trạng thái xử lý</h2>
            <div className="stepper" role="list" aria-label="Trạng thái xử lý đơn hàng">
              {STEPPER_STEPS.map((stepLabel, index) => {
                const stepState = index < currentStepIndex
                  ? 'is-completed'
                  : index === currentStepIndex
                    ? 'is-active'
                    : 'is-inactive';

                return (
                  <div key={stepLabel} className={`step ${stepState}`} role="listitem">
                    <div className="circle" aria-hidden="true">{index + 1}</div>
                    <div className="label">{stepLabel}</div>
                    {index < STEPPER_STEPS.length - 1 && <div className="line" aria-hidden="true" />}
                  </div>
                );
              })}
            </div>
          </article>
        </section>
      )}
    </div>
  );
};

export default InvoiceDetailPage;