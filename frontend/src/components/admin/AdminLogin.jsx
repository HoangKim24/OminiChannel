import { useState } from 'react';
import '../../styles/AdminLogin.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const AdminLogin = ({ onLogin, setPage, showToast }) => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (res.ok) {
                if (data.role === 'Admin') {
                    onLogin(data);
                    showToast(`Chào mừng Admin ${data.username} trở lại!`, 'success');
                } else {
                    showToast('Tài khoản này không có quyền truy cập Admin.', 'error');
                }
            } else {
                showToast(data.message || 'Đăng nhập thất bại', 'error');
            }
        } catch {
            showToast('Lỗi kết nối máy chủ', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="login-card fade-in-up">
                <span className="login-logo">KP LUXURY</span>
                <p className="login-subtitle">Management Console</p>
                
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Tài khoản hệ thống</label>
                        <input 
                            type="text" 
                            className="luxury-input"
                            required 
                            placeholder="Nhập username..."
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>
                    
                    <div className="input-group">
                        <label>Mật mã bảo mật</label>
                        <input 
                            type="password" 
                            className="luxury-input"
                            required 
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Đang xác thực...' : 'Đăng Nhập Hệ Thống'}
                    </button>
                </form>

                <div className="login-footer">
                    <a href="/" onClick={(e) => { e.preventDefault(); setPage('home'); }} className="back-link">
                        ← Quay lại trang chủ
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;

