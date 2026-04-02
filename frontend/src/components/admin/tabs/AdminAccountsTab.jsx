import { useEffect, useMemo, useState } from 'react';
import { useToast } from '../../../utils/toastContext.jsx';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const normalizeUser = (user) => ({
  id: user.id ?? user.Id,
  username: user.username ?? user.Username ?? '',
  email: user.email ?? user.Email ?? '',
  fullName: user.fullName ?? user.FullName ?? '',
  phoneNumber: user.phoneNumber ?? user.PhoneNumber ?? '',
  address: user.address ?? user.Address ?? '',
  role: user.role ?? user.Role ?? 'User',
});

const AdminAccountsTab = ({ user, onRefresh }) => {
  const { success, error } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [savingUserId, setSavingUserId] = useState(null);

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    'X-User-Role': user?.role || 'Admin',
    ...(user?.accessToken ? { Authorization: `Bearer ${user.accessToken}` } : {}),
  }), [user?.accessToken, user?.role]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/users`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Không thể tải danh sách tài khoản');
      }

      setUsers(Array.isArray(data) ? data.map(normalizeUser) : []);
    } catch (err) {
      error(err.message || 'Lỗi tải tài khoản admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const adminUsers = useMemo(() => users.filter((item) => String(item.role || '').trim().toLowerCase() === 'admin'), [users]);
  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return adminUsers.filter((item) => {
      if (!query) return true;
      return [item.username, item.fullName, item.email, item.phoneNumber]
        .some((field) => String(field || '').toLowerCase().includes(query));
    });
  }, [adminUsers, searchQuery]);

  const adminCount = adminUsers.length;

  const updateRole = async (targetUser, nextRole) => {
    if (targetUser.id === user?.id && nextRole.toLowerCase() !== 'admin') {
      if (adminCount <= 1) {
        error('Không thể hạ quyền admin cuối cùng.');
        return;
      }
    }

    try {
      setSavingUserId(targetUser.id);
      const res = await fetch(`${API_BASE}/api/users/${targetUser.id}/role`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ role: nextRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Không thể cập nhật quyền');
      }

      success(data.message || 'Đã cập nhật quyền tài khoản');
      await loadUsers();
      if (onRefresh) onRefresh();
    } catch (err) {
      error(err.message || 'Lỗi cập nhật quyền');
    } finally {
      setSavingUserId(null);
    }
  };

  const deleteUser = async (targetUser) => {
    if (targetUser.id === user?.id) {
      error('Không thể tự xóa tài khoản đang đăng nhập.');
      return;
    }

    const confirmDelete = window.confirm(`Xóa tài khoản ${targetUser.username}?`);
    if (!confirmDelete) return;

    try {
      setSavingUserId(targetUser.id);
      const res = await fetch(`${API_BASE}/api/users/${targetUser.id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Không thể xóa tài khoản');
      }

      success(data.message || 'Đã xóa tài khoản');
      await loadUsers();
      if (onRefresh) onRefresh();
    } catch (err) {
      error(err.message || 'Lỗi xóa tài khoản');
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <div className="fade-in admin-tab customers-tab">
      <div className="glass-panel shadow-gold admin-tab-shell">
        <div className="admin-tab-header">
          <div>
            <h2 className="brand-font admin-tab-title">Quản lý tài khoản admin</h2>
            <p className="admin-tab-subtitle">
              Tìm kiếm, phân quyền và xử lý các tài khoản có quyền quản trị hệ thống.
            </p>
          </div>
          <div className="admin-tab-actions">
            <input
              type="text"
              placeholder="🔍 Tìm tài khoản admin..."
              className="luxury-input-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, minWidth: '220px' }}
            />
            <button className="luxury-button-gold" onClick={loadUsers}>Làm mới</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div className="glass-panel" style={{ padding: '1rem 1.25rem', minWidth: '200px' }}>
            <div className="inventory-kpi-label">Tổng tài khoản admin</div>
            <div className="brand-font inventory-kpi-value">{adminCount}</div>
          </div>
          <div className="glass-panel" style={{ padding: '1rem 1.25rem', minWidth: '200px' }}>
            <div className="inventory-kpi-label">Đang đăng nhập</div>
            <div className="brand-font inventory-kpi-value">{user?.username || 'N/A'}</div>
          </div>
          <div className="glass-panel" style={{ padding: '1rem 1.25rem', minWidth: '200px' }}>
            <div className="inventory-kpi-label">Trạng thái tìm kiếm</div>
            <div className="brand-font inventory-kpi-value">{filteredUsers.length}</div>
          </div>
        </div>

        {loading ? (
          <div className="admin-table-loading" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
            Đang tải danh sách tài khoản...
          </div>
        ) : (
          <div className="table-container shadow-gold admin-table-shell">
            <table className="admin-table-modern">
              <thead className="admin-table-head">
                <tr>
                  <th className="admin-th">Tài khoản</th>
                  <th className="admin-th">Liên hệ</th>
                  <th className="admin-th">Vai trò</th>
                  <th className="admin-th admin-th-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? filteredUsers.map((item) => {
                  const isCurrentUser = item.id === user?.id;
                  return (
                    <tr key={item.id} className="table-row-hover admin-tr">
                      <td className="admin-td">
                        <strong>{item.username}</strong>
                        <div className="admin-cell-sub">{item.fullName || 'Chưa đặt tên'}</div>
                      </td>
                      <td className="admin-td">
                        <div className="admin-cell-sub">{item.email || 'Chưa có email'}</div>
                        <div className="admin-cell-sub">{item.phoneNumber || 'Chưa có SĐT'}</div>
                      </td>
                      <td className="admin-td">
                        <span className={`luxury-badge ${String(item.role).toLowerCase() === 'admin' ? 'gender-badge-male' : 'gender-badge-unspecified'}`}>
                          {item.role}
                        </span>
                      </td>
                      <td className="admin-td admin-td-center">
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                          {String(item.role).toLowerCase() === 'admin' ? (
                            <button
                              className="luxury-input-field admin-mini-btn"
                              disabled={savingUserId === item.id}
                              onClick={() => updateRole(item, 'User')}
                            >
                              Hạ xuống User
                            </button>
                          ) : (
                            <button
                              className="luxury-input-field admin-mini-btn"
                              disabled={savingUserId === item.id}
                              onClick={() => updateRole(item, 'Admin')}
                            >
                              Cấp quyền Admin
                            </button>
                          )}
                          <button
                            className="luxury-input-field admin-mini-btn"
                            disabled={savingUserId === item.id || isCurrentUser}
                            onClick={() => deleteUser(item)}
                          >
                            Xóa
                          </button>
                        </div>
                        {isCurrentUser && <div className="admin-cell-sub" style={{ marginTop: '0.35rem' }}>Tài khoản hiện tại</div>}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={4} className="admin-empty-cell">Không có tài khoản admin phù hợp.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAccountsTab;
