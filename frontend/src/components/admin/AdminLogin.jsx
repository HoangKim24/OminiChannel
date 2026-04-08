import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useToast } from '../../utils/useToast.jsx';
import '../../styles/AdminLogin.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const AdminLogin = () => {
    const navigate = useNavigate();
    const setUser = useAppStore(state => state.setUser);
    const { success, error } = useToast();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/admin-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, loginRole: 'Admin' })
            });
            const data = await res.json();
            
            if (res.ok) {
                setUser({ id: data.id, username: data.username, role: data.role, accessToken: data.accessToken, fullName: data.fullName });
                success(`Chào mừng Admin ${data.fullName || data.username} trở lại!`);
                navigate('/admin', { replace: true });
            } else {
                error(data.message || 'Đăng nhập admin thất bại');
            }
        } catch {
            error('Lỗi kết nối máy chủ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="login-card fade-in-up">
                <span className="login-logo">KP LUXURY</span>
                <p className="login-subtitle">Bảng điều khiển quản trị</p>
                <p style={{ margin: '0 0 1rem', color: '#b7b7b7', textAlign: 'center' }}>Đăng nhập dành riêng cho tài khoản quản trị.</p>
                
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
                    <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="back-link">
                        ← Quay lại trang chủ
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;

