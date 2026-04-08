import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useToast } from '../../utils/useToast.jsx';
import '../../styles/AdminLogin.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const readApiError = async (response, fallbackMessage) => {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        try {
            const data = await response.json();
            return data?.message || fallbackMessage;
        } catch {
            return fallbackMessage;
        }
    }

    try {
        const text = await response.text();
        return text?.trim() || fallbackMessage;
    } catch {
        return fallbackMessage;
    }
};

const AdminLogin = () => {
    const navigate = useNavigate();
    const setUser = useAppStore(state => state.setUser);
    const { success, error } = useToast();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFormError('');
        try {
            const res = await fetch(`${API_BASE}/api/auth/admin-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, loginRole: 'Admin' })
            });
            if (res.ok) {
                const data = await res.json();
                setUser({ id: data.id, username: data.username, role: data.role, accessToken: data.accessToken, fullName: data.fullName });
                success(`Chào mừng Admin ${data.fullName || data.username} trở lại!`);
                navigate('/admin', { replace: true });
            } else {
                const message = await readApiError(res, 'Tài khoản admin hoặc mật khẩu không đúng');
                setFormError(message);
                error(message);
            }
        } catch {
            const message = 'Lỗi kết nối máy chủ';
            setFormError(message);
            error(message);
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

                {formError && (
                    <div className="login-error" role="alert" aria-live="polite">
                        {formError}
                    </div>
                )}
                
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Tài khoản hệ thống</label>
                        <input 
                            type="text" 
                            className="luxury-input"
                            required 
                            placeholder="Nhập username..."
                            value={formData.username}
                            onChange={(e) => {
                                setFormData({ ...formData, username: e.target.value });
                                setFormError('');
                            }}
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
                            onChange={(e) => {
                                setFormData({ ...formData, password: e.target.value });
                                setFormError('');
                            }}
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

