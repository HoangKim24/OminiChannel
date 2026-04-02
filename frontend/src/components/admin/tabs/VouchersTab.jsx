import { useEffect, useMemo, useState } from 'react';
import { useToast } from '../../../utils/toastContext.jsx';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const EMPTY_FORM = {
  code: '',
  name: '',
  description: '',
  voucherType: 'Order',
  discountType: 'FixedAmount',
  discountValue: '',
  maxDiscountAmount: '',
  minOrderValue: '',
  startAt: '',
  endAt: '',
  usageLimitTotal: '',
  usageLimitPerUser: '',
  salesChannelId: '',
  isActive: true,
};

const toDatetimeLocal = (value) => {
  if (!value) return '';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '';
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  const hh = String(dt.getHours()).padStart(2, '0');
  const mi = String(dt.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
};

const normalizeVoucher = (voucher) => ({
  id: voucher.id,
  code: voucher.code,
  name: voucher.name,
  description: voucher.description || '',
  voucherType: voucher.voucherType,
  discountType: voucher.discountType,
  discountValue: Number(voucher.discountValue || 0),
  maxDiscountAmount: voucher.maxDiscountAmount == null ? null : Number(voucher.maxDiscountAmount),
  minOrderValue: Number(voucher.minOrderValue || 0),
  startAt: voucher.startAt,
  endAt: voucher.endAt,
  usageLimitTotal: voucher.usageLimitTotal,
  usageLimitPerUser: voucher.usageLimitPerUser,
  salesChannelId: voucher.salesChannelId,
  salesChannelName: voucher.salesChannelName || 'Tất cả kênh',
  isActive: Boolean(voucher.isActive),
  isDeleted: Boolean(voucher.isDeleted),
  totalRedemptions: Number(voucher.totalRedemptions || 0),
});

const VouchersTab = ({ user }) => {
  const { success, error } = useToast();

  const [vouchers, setVouchers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    'X-User-Role': user?.role || 'Admin',
    ...(user?.accessToken ? { Authorization: `Bearer ${user.accessToken}` } : {}),
  }), [user?.accessToken, user?.role]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [voucherRes, channelRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/vouchers`, { headers: authHeaders }),
        fetch(`${API_BASE}/api/channels`, { headers: authHeaders }),
      ]);

      const voucherData = await voucherRes.json().catch(() => []);
      if (!voucherRes.ok) {
        throw new Error(voucherData?.message || 'Không thể tải danh sách mã giảm giá');
      }

      const channelData = await channelRes.json().catch(() => []);
      setVouchers(Array.isArray(voucherData) ? voucherData.map(normalizeVoucher) : []);
      setChannels(Array.isArray(channelData) ? channelData.filter((item) => item.isActive) : []);
    } catch (err) {
      error(err.message || 'Lỗi tải dữ liệu mã giảm giá');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const filteredVouchers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return vouchers.filter((voucher) => {
      const matchesQuery = !query || [voucher.code, voucher.name, voucher.description]
        .some((field) => String(field || '').toLowerCase().includes(query));

      const matchesType = filterType === 'all' || voucher.voucherType === filterType;

      const status = voucher.isActive && !voucher.isDeleted ? 'active' : 'inactive';
      const matchesStatus = filterStatus === 'all' || status === filterStatus;

      return matchesQuery && matchesType && matchesStatus;
    });
  }, [filterStatus, filterType, searchQuery, vouchers]);

  const resetForm = () => {
    setEditingVoucher(null);
    setFormData(EMPTY_FORM);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (voucher) => {
    setEditingVoucher(voucher);
    setFormData({
      code: voucher.code,
      name: voucher.name,
      description: voucher.description || '',
      voucherType: voucher.voucherType,
      discountType: voucher.discountType,
      discountValue: String(voucher.discountValue),
      maxDiscountAmount: voucher.maxDiscountAmount == null ? '' : String(voucher.maxDiscountAmount),
      minOrderValue: String(voucher.minOrderValue),
      startAt: toDatetimeLocal(voucher.startAt),
      endAt: toDatetimeLocal(voucher.endAt),
      usageLimitTotal: voucher.usageLimitTotal == null ? '' : String(voucher.usageLimitTotal),
      usageLimitPerUser: voucher.usageLimitPerUser == null ? '' : String(voucher.usageLimitPerUser),
      salesChannelId: voucher.salesChannelId == null ? '' : String(voucher.salesChannelId),
      isActive: voucher.isActive,
    });
    setIsModalOpen(true);
  };

  const submitForm = async (event) => {
    event.preventDefault();

    try {
      setIsSaving(true);

      const payload = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        voucherType: formData.voucherType,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        maxDiscountAmount: formData.maxDiscountAmount === '' ? null : Number(formData.maxDiscountAmount),
        minOrderValue: Number(formData.minOrderValue || 0),
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString(),
        usageLimitTotal: formData.usageLimitTotal === '' ? null : Number(formData.usageLimitTotal),
        usageLimitPerUser: formData.usageLimitPerUser === '' ? null : Number(formData.usageLimitPerUser),
        salesChannelId: formData.salesChannelId === '' ? null : Number(formData.salesChannelId),
        isActive: Boolean(formData.isActive),
      };

      const method = editingVoucher ? 'PUT' : 'POST';
      const endpoint = editingVoucher
        ? `${API_BASE}/api/admin/vouchers/${editingVoucher.id}`
        : `${API_BASE}/api/admin/vouchers`;

      const response = await fetch(endpoint, {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || 'Không thể lưu mã giảm giá');
      }

      success(editingVoucher ? 'Đã cập nhật mã giảm giá' : 'Đã tạo mã giảm giá mới');
      setIsModalOpen(false);
      resetForm();
      await loadInitialData();
    } catch (err) {
      error(err.message || 'Lỗi khi lưu mã giảm giá');
    } finally {
      setIsSaving(false);
    }
  };

  const disableVoucher = async (voucher) => {
    const confirmed = window.confirm(`Vô hiệu hóa mã giảm giá ${voucher.code}?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE}/api/admin/vouchers/${voucher.id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || 'Không thể vô hiệu hóa mã giảm giá');
      }

      success('Đã vô hiệu hóa mã giảm giá');
      await loadInitialData();
    } catch (err) {
      error(err.message || 'Lỗi khi vô hiệu hóa mã giảm giá');
    }
  };

  return (
    <div className="fade-in admin-tab vouchers-tab">
      <div className="glass-panel shadow-gold admin-tab-shell">
        <div className="admin-tab-header">
          <div>
            <h2 className="brand-font admin-tab-title">Quản lý mã giảm giá</h2>
            <p className="admin-tab-subtitle">Tạo, chỉnh sửa và vô hiệu hóa mã giảm giá theo loại đơn hàng/vận chuyển.</p>
          </div>
          <div className="admin-tab-actions">
            <input
              type="text"
              placeholder="🔍 Tìm mã hoặc tên chương trình..."
              className="luxury-input-field"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              style={{ minWidth: '240px' }}
            />
            <select className="luxury-input-field admin-filter-input" value={filterType} onChange={(event) => setFilterType(event.target.value)}>
              <option value="all">Tất cả loại</option>
              <option value="Order">Đơn hàng</option>
              <option value="Shipping">Vận chuyển</option>
            </select>
            <select className="luxury-input-field admin-filter-input" value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã vô hiệu</option>
            </select>
            <button className="luxury-button-gold" onClick={openCreateModal}>+ Tạo mã giảm giá</button>
          </div>
        </div>

        {isLoading ? (
          <div className="admin-empty-cell">Đang tải danh sách mã giảm giá...</div>
        ) : (
          <div className="table-container shadow-gold admin-table-shell">
            <table className="admin-table-modern">
              <thead className="admin-table-head">
                <tr>
                  <th className="admin-th">Mã</th>
                  <th className="admin-th">Thông tin</th>
                  <th className="admin-th">Giảm giá</th>
                  <th className="admin-th">Điều kiện</th>
                  <th className="admin-th">Kênh</th>
                  <th className="admin-th">Trạng thái</th>
                  <th className="admin-th admin-th-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="admin-empty-cell">Không tìm thấy mã giảm giá phù hợp.</td>
                  </tr>
                ) : filteredVouchers.map((voucher) => (
                  <tr key={voucher.id} className="table-row-hover admin-tr">
                    <td className="admin-td">
                      <strong className="admin-order-code">{voucher.code}</strong>
                      <div className="admin-cell-sub">{voucher.voucherType === 'Order' ? 'Đơn hàng' : 'Vận chuyển'}</div>
                    </td>
                    <td className="admin-td">
                      <div className="admin-cell-text" style={{ color: '#fff', fontWeight: 700 }}>{voucher.name}</div>
                      <div className="admin-cell-sub">{voucher.description || 'Không có mô tả'}</div>
                    </td>
                    <td className="admin-td">
                      <div className="admin-cell-text">
                        {voucher.discountType === 'Percentage'
                          ? `${voucher.discountValue}%${voucher.maxDiscountAmount != null ? ` (tối đa ${voucher.maxDiscountAmount})` : ''}`
                          : `${voucher.discountValue}`}
                      </div>
                      <div className="admin-cell-sub">{voucher.discountType === 'Percentage' ? 'Phần trăm' : 'Số tiền cố định'}</div>
                    </td>
                    <td className="admin-td">
                      <div className="admin-cell-text">Đơn tối thiểu: {voucher.minOrderValue}</div>
                      <div className="admin-cell-sub">
                        Đã dùng: {voucher.totalRedemptions}
                        {voucher.usageLimitTotal != null ? ` / ${voucher.usageLimitTotal}` : ' / ∞'}
                      </div>
                    </td>
                    <td className="admin-td">
                      <div className="admin-cell-text">{voucher.salesChannelName || 'Tất cả kênh'}</div>
                      <div className="admin-cell-sub">Mỗi người dùng: {voucher.usageLimitPerUser ?? '∞'}</div>
                    </td>
                    <td className="admin-td">
                      <span className={`luxury-badge ${voucher.isActive && !voucher.isDeleted ? 'order-status-confirmed' : 'order-status-cancelled'}`}>
                        {voucher.isActive && !voucher.isDeleted ? 'Hoạt động' : 'Vô hiệu'}
                      </span>
                    </td>
                    <td className="admin-td admin-td-center">
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="luxury-input-field admin-mini-btn" onClick={() => openEditModal(voucher)}>Sửa</button>
                        <button
                          className="luxury-input-field admin-mini-btn"
                          onClick={() => disableVoucher(voucher)}
                          disabled={!voucher.isActive || voucher.isDeleted}
                        >
                          Vô hiệu hóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay admin-modal-overlay-right">
          <div className="glass-panel fade-in-right admin-side-modal">
            <div className="admin-modal-head">
              <h2 className="brand-font admin-modal-title">{editingVoucher ? 'Cập nhật mã giảm giá' : 'Tạo mã giảm giá mới'}</h2>
              <button className="admin-modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <form className="admin-modal-form" onSubmit={submitForm}>
              <div className="admin-form-grid-2">
                <div className="input-group">
                  <label className="admin-field-label">Mã giảm giá</label>
                  <input className="luxury-input-field admin-field-full" required value={formData.code} onChange={(event) => setFormData({ ...formData, code: event.target.value })} />
                </div>
                <div className="input-group">
                  <label className="admin-field-label">Tên chương trình</label>
                  <input className="luxury-input-field admin-field-full" required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} />
                </div>
              </div>

              <div className="input-group">
                <label className="admin-field-label">Mô tả</label>
                <input className="luxury-input-field admin-field-full" value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} />
              </div>

              <div className="admin-form-grid-2">
                <div className="input-group">
                  <label className="admin-field-label">Loại voucher</label>
                  <select className="luxury-input-field admin-field-full" value={formData.voucherType} onChange={(event) => setFormData({ ...formData, voucherType: event.target.value })}>
                    <option value="Order">Đơn hàng</option>
                    <option value="Shipping">Vận chuyển</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="admin-field-label">Kiểu giảm giá</label>
                  <select className="luxury-input-field admin-field-full" value={formData.discountType} onChange={(event) => setFormData({ ...formData, discountType: event.target.value })}>
                    <option value="FixedAmount">Số tiền cố định</option>
                    <option value="Percentage">Phần trăm</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-grid-2">
                <div className="input-group">
                  <label className="admin-field-label">Giá trị giảm</label>
                  <input type="number" step="0.01" className="luxury-input-field admin-field-full" required value={formData.discountValue} onChange={(event) => setFormData({ ...formData, discountValue: event.target.value })} />
                </div>
                <div className="input-group">
                  <label className="admin-field-label">Giảm tối đa</label>
                  <input type="number" step="0.01" className="luxury-input-field admin-field-full" value={formData.maxDiscountAmount} onChange={(event) => setFormData({ ...formData, maxDiscountAmount: event.target.value })} />
                </div>
              </div>

              <div className="admin-form-grid-2">
                <div className="input-group">
                  <label className="admin-field-label">Giá trị đơn tối thiểu</label>
                  <input type="number" step="0.01" className="luxury-input-field admin-field-full" value={formData.minOrderValue} onChange={(event) => setFormData({ ...formData, minOrderValue: event.target.value })} />
                </div>
                <div className="input-group">
                  <label className="admin-field-label">Kênh bán</label>
                  <select className="luxury-input-field admin-field-full" value={formData.salesChannelId} onChange={(event) => setFormData({ ...formData, salesChannelId: event.target.value })}>
                    <option value="">Tất cả kênh</option>
                    {channels.map((channel) => (
                      <option key={channel.id} value={channel.id}>{channel.channelName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-form-grid-2">
                <div className="input-group">
                  <label className="admin-field-label">Giới hạn sử dụng tổng</label>
                  <input type="number" className="luxury-input-field admin-field-full" value={formData.usageLimitTotal} onChange={(event) => setFormData({ ...formData, usageLimitTotal: event.target.value })} />
                </div>
                <div className="input-group">
                  <label className="admin-field-label">Giới hạn mỗi người dùng</label>
                  <input type="number" className="luxury-input-field admin-field-full" value={formData.usageLimitPerUser} onChange={(event) => setFormData({ ...formData, usageLimitPerUser: event.target.value })} />
                </div>
              </div>

              <div className="admin-form-grid-2">
                <div className="input-group">
                  <label className="admin-field-label">Bắt đầu lúc</label>
                  <input type="datetime-local" className="luxury-input-field admin-field-full" required value={formData.startAt} onChange={(event) => setFormData({ ...formData, startAt: event.target.value })} />
                </div>
                <div className="input-group">
                  <label className="admin-field-label">Kết thúc lúc</label>
                  <input type="datetime-local" className="luxury-input-field admin-field-full" required value={formData.endAt} onChange={(event) => setFormData({ ...formData, endAt: event.target.value })} />
                </div>
              </div>

              <label className="checkout-choice" style={{ marginTop: '0.35rem' }}>
                <input type="checkbox" checked={formData.isActive} onChange={(event) => setFormData({ ...formData, isActive: event.target.checked })} />
                <div>
                  <strong>Mã giảm giá đang hoạt động</strong>
                  <span>Tắt để giữ mã nhưng không cho áp dụng ở bước thanh toán.</span>
                </div>
              </label>

              <div className="admin-modal-actions">
                <button type="submit" className="luxury-button-gold" style={{ flex: 1 }} disabled={isSaving}>
                  {isSaving ? 'ĐANG LƯU...' : editingVoucher ? 'CẬP NHẬT' : 'TẠO MỚI'}
                </button>
                <button type="button" className="luxury-input-field" onClick={() => setIsModalOpen(false)}>HỦY</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VouchersTab;
