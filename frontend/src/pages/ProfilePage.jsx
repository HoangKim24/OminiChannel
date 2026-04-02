import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useToast } from '../utils/toastContext.jsx';
import './ProfilePage.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const vnd = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price || 0) * 24000);

const normalizeUser = (user) => ({
  id: user?.id ?? user?.Id,
  username: user?.username ?? user?.Username ?? '',
  email: user?.email ?? user?.Email ?? '',
  fullName: user?.fullName ?? user?.FullName ?? '',
  phoneNumber: user?.phoneNumber ?? user?.PhoneNumber ?? '',
  address: user?.address ?? user?.Address ?? '',
  role: user?.role ?? user?.Role ?? 'User',
});

const ProfilePage = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const storedUser = useAppStore((state) => state.user);
  const orders = useAppStore((state) => state.orders);
  const loadingOrders = useAppStore((state) => state.loadingOrders);
  const fetchOrders = useAppStore((state) => state.fetchOrders);
  const setUser = useAppStore((state) => state.setUser);
  const favorites = useAppStore((state) => state.favorites);

  const [profile, setProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: '', email: '', phoneNumber: '', address: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const currentUser = profile ? normalizeUser(profile) : normalizeUser(storedUser);

  useEffect(() => {
    if (!storedUser) {
      navigate('/');
      return;
    }

    const loadProfile = async () => {
      setIsProfileLoading(true);
      try {
        const headers = {};
        if (storedUser?.accessToken) {
          headers.Authorization = `Bearer ${storedUser.accessToken}`;
        }
        if (storedUser?.role) {
          headers['X-User-Role'] = storedUser.role;
        }

        const res = await fetch(`${API_BASE}/api/users/me`, { headers });
        if (!res.ok) {
          throw new Error('Không thể tải hồ sơ');
        }

        const data = await res.json();
        const normalized = normalizeUser(data);
        setProfile(normalized);
        setProfileForm({
          fullName: normalized.fullName,
          email: normalized.email,
          phoneNumber: normalized.phoneNumber,
          address: normalized.address,
        });
      } catch (err) {
        const fallback = normalizeUser(storedUser);
        setProfile(fallback);
        setProfileForm({
          fullName: fallback.fullName,
          email: fallback.email,
          phoneNumber: fallback.phoneNumber,
          address: fallback.address,
        });
        error(err.message || 'Không tải được hồ sơ cá nhân');
      } finally {
        setIsProfileLoading(false);
      }
    };

    loadProfile();
    fetchOrders();
  }, [error, fetchOrders, navigate, storedUser]);

  const orderTotals = useMemo(() => {
    const totalSpent = Array.isArray(orders)
      ? orders.reduce((sum, order) => sum + Number(order.totalAmount ?? order.TotalAmount ?? 0), 0)
      : 0;
    const latestOrder = Array.isArray(orders) && orders.length > 0 ? orders[0] : null;
    return {
      totalOrders: Array.isArray(orders) ? orders.length : 0,
      totalSpent,
      latestOrder,
    };
  }, [orders]);

  const topItems = useMemo(() => {
    const flatItems = (Array.isArray(orders) ? orders : []).flatMap((order) => order.items || order.Items || []);
    const grouped = new Map();

    flatItems.forEach((item) => {
      const name = item.perfumeName || item.PerfumeName || 'Sản phẩm';
      const quantity = Number(item.quantity ?? item.Quantity ?? 0);
      const total = Number(item.price ?? item.Price ?? 0) * Math.max(1, quantity);
      const current = grouped.get(name) || { name, quantity: 0, total: 0 };
      current.quantity += quantity || 0;
      current.total += total;
      grouped.set(name, current);
    });

    return Array.from(grouped.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  }, [orders]);

  const recentOrders = useMemo(() => (Array.isArray(orders) ? orders.slice(0, 5) : []), [orders]);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setIsSavingProfile(true);

    try {
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: storedUser?.accessToken ? `Bearer ${storedUser.accessToken}` : '',
          ...(storedUser?.role ? { 'X-User-Role': storedUser.role } : {}),
        },
        body: JSON.stringify(profileForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Không thể cập nhật hồ sơ');
      }

      const updatedUser = normalizeUser({ ...storedUser, ...data.user, accessToken: storedUser?.accessToken });
      setUser({ ...storedUser, ...updatedUser });
      setProfile(updatedUser);
      success('Cập nhật hồ sơ thành công');
    } catch (err) {
      error(err.message || 'Cập nhật hồ sơ thất bại');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setIsChangingPassword(true);

    try {
      const res = await fetch(`${API_BASE}/api/users/me/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: storedUser?.accessToken ? `Bearer ${storedUser.accessToken}` : '',
          ...(storedUser?.role ? { 'X-User-Role': storedUser.role } : {}),
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Không thể đổi mật khẩu');
      }

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      success('Đổi mật khẩu thành công');
    } catch (err) {
      error(err.message || 'Đổi mật khẩu thất bại');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!storedUser) return null;

  return (
    <div className="profile-page">
      <section className="profile-hero admin-panel shadow-gold">
        <div>
          <p className="profile-eyebrow">Tài khoản cá nhân</p>
          <h1 className="profile-title">Hồ sơ của {currentUser.fullName || currentUser.username || 'bạn'}</h1>
          <p className="profile-subtitle">Quản lý thông tin cá nhân, bảo mật và theo dõi toàn bộ hoạt động mua sắm trong một nơi.</p>
        </div>
        <div className="profile-hero-card">
          <div className="profile-avatar">{(currentUser.fullName || currentUser.username || 'U').slice(0, 1).toUpperCase()}</div>
          <div>
            <strong>{currentUser.fullName || 'Chưa đặt tên'}</strong>
            <p>@{currentUser.username}</p>
            <span className="profile-role">{currentUser.role}</span>
          </div>
        </div>
      </section>

      <section className="profile-stats-grid">
        <article className="profile-stat admin-panel">
          <span>Đơn hàng</span>
          <strong>{orderTotals.totalOrders}</strong>
        </article>
        <article className="profile-stat admin-panel">
          <span>Đã chi tiêu</span>
          <strong>{vnd(orderTotals.totalSpent)}</strong>
        </article>
        <article className="profile-stat admin-panel">
          <span>Yêu thích</span>
          <strong>{favorites.length}</strong>
        </article>
        <article className="profile-stat admin-panel">
          <span>Đơn gần nhất</span>
          <strong>{orderTotals.latestOrder ? `#${orderTotals.latestOrder.id ?? orderTotals.latestOrder.Id}` : 'Chưa có'}</strong>
        </article>
      </section>

      <section className="profile-layout">
        <div className="profile-column">
          <article className="profile-card admin-panel shadow-gold">
            <div className="profile-card-head">
              <h2>Thông tin tài khoản</h2>
              <button className="profile-link-btn" type="button" onClick={() => navigate('/favorites')}>Xem yêu thích</button>
            </div>

            {isProfileLoading ? (
              <div className="profile-loading">Đang tải hồ sơ...</div>
            ) : (
              <form className="profile-form" onSubmit={handleProfileSubmit}>
                <label>
                  <span>Họ và tên</span>
                  <input type="text" value={profileForm.fullName} onChange={(e) => setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))} placeholder="Nhập họ và tên" />
                </label>
                <label>
                  <span>Email</span>
                  <input type="email" value={profileForm.email} onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="email@domain.com" />
                </label>
                <label>
                  <span>Số điện thoại</span>
                  <input type="tel" value={profileForm.phoneNumber} onChange={(e) => setProfileForm((prev) => ({ ...prev, phoneNumber: e.target.value }))} placeholder="Nhập số điện thoại" />
                </label>
                <label>
                  <span>Địa chỉ giao hàng mặc định</span>
                  <textarea rows="4" value={profileForm.address} onChange={(e) => setProfileForm((prev) => ({ ...prev, address: e.target.value }))} placeholder="Nhập địa chỉ mặc định" />
                </label>
                <button type="submit" className="profile-primary-btn" disabled={isSavingProfile}>
                  {isSavingProfile ? 'Đang lưu...' : 'Lưu hồ sơ'}
                </button>
              </form>
            )}
          </article>

          <article className="profile-card admin-panel shadow-gold">
            <h2>Bảo mật</h2>
            <form className="profile-form" onSubmit={handlePasswordSubmit}>
              <label>
                <span>Mật khẩu hiện tại</span>
                <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))} placeholder="Nhập mật khẩu hiện tại" />
              </label>
              <label>
                <span>Mật khẩu mới</span>
                <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))} placeholder="Tối thiểu 6 ký tự" />
              </label>
              <label>
                <span>Xác nhận mật khẩu mới</span>
                <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))} placeholder="Nhập lại mật khẩu mới" />
              </label>
              <button type="submit" className="profile-secondary-btn" disabled={isChangingPassword}>
                {isChangingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
              </button>
            </form>
          </article>
        </div>

        <div className="profile-column">
          <article className="profile-card admin-panel shadow-gold">
            <h2>Tổng quan mua sắm</h2>
            <div className="profile-summary-list">
              <div>
                <span>Vai trò</span>
                <strong>{currentUser.role}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{currentUser.email || 'Chưa cập nhật'}</strong>
              </div>
              <div>
                <span>Số điện thoại</span>
                <strong>{currentUser.phoneNumber || 'Chưa cập nhật'}</strong>
              </div>
              <div>
                <span>Địa chỉ</span>
                <strong>{currentUser.address || 'Chưa cập nhật'}</strong>
              </div>
            </div>
          </article>

          <article className="profile-card admin-panel shadow-gold">
            <h2>Đơn hàng gần đây</h2>
            {loadingOrders ? (
              <div className="profile-loading">Đang tải lịch sử đơn hàng...</div>
            ) : recentOrders.length === 0 ? (
              <div className="profile-empty">Bạn chưa có đơn hàng nào.</div>
            ) : (
              <div className="profile-order-list">
                {recentOrders.map((order) => {
                  const id = order.id ?? order.Id;
                  const items = order.items || order.Items || [];
                  const total = order.totalAmount ?? order.TotalAmount ?? 0;
                  const status = order.status || order.Status || 'Pending';
                  return (
                    <article key={id} className="profile-order-card">
                      <div className="profile-order-head">
                        <strong>#{id}</strong>
                        <span>{status}</span>
                      </div>
                      <p>{order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : 'Chưa xác định ngày'}</p>
                      <div className="profile-order-meta">
                        <span>{items.length} sản phẩm</span>
                        <strong>{vnd(total)}</strong>
                      </div>
                      <button type="button" className="profile-link-btn" onClick={() => navigate('/admin')}>Mở trung tâm đơn hàng</button>
                    </article>
                  );
                })}
              </div>
            )}
          </article>

          <article className="profile-card admin-panel shadow-gold">
            <h2>Sản phẩm mua nhiều</h2>
            {topItems.length === 0 ? (
              <div className="profile-empty">Chưa có dữ liệu sản phẩm.</div>
            ) : (
              <div className="profile-top-items">
                {topItems.map((item) => (
                  <div key={item.name} className="profile-top-item">
                    <div>
                      <strong>{item.name}</strong>
                      <p>{item.quantity} lượt mua</p>
                    </div>
                    <span>{vnd(item.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
