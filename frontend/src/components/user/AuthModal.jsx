import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const AuthModal = () => {
  const mode = useAppStore(state => state.authModal);
  const setAuthModal = useAppStore(state => state.setAuthModal);
  const setUser = useAppStore(state => state.setUser);
  const showToast = useAppStore(state => state.showToast);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Clear form when mode changes
  useEffect(() => {
    setUsername('')
    setPassword('')
    setFullName('')
    setEmail('')
    setPhoneNumber('')
    setErrors({})
  }, [mode])

  if (!mode) return null;
  // Validation functions
  const validateUsername = (username) => {
    if (!username.trim()) return 'Tên đăng nhập không được để trống';
    if (username.length < 3) return 'Tên đăng nhập phải tối thiểu 3 ký tự';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Tên đăng nhập chỉ được chứa chữ, số và dấu gạch dưới';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Mật khẩu không được để trống';
    if (password.length < 6) return 'Mật khẩu phải tối thiểu 6 ký tự';
    if (!/[0-9]/.test(password)) return 'Mật khẩu phải chứa ít nhất một chữ số';
    if (!/[a-zA-Z]/.test(password)) return 'Mật khẩu phải chứa ít nhất một chữ cái';
    return '';
  };

  const validateFullName = (name) => {
    if (!name.trim()) return 'Họ và tên không được để trống';
    if (name.length < 2) return 'Họ và tên phải tối thiểu 2 ký tự';
    return '';
  };

  const validateEmail = (email) => {
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Email không hợp lệ';
    }
    return '';
  };

  const validatePhoneNumber = (phone) => {
    if (phone.trim() && !/^[0-9]{9,11}$/.test(phone.replace(/\D/g, ''))) {
      return 'Số điện thoại phải từ 9-11 chữ số';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate inputs
    const usernameErr = validateUsername(username);
    if (usernameErr) newErrors.username = usernameErr;

    const passwordErr = validatePassword(password);
    if (passwordErr) newErrors.password = passwordErr;

    if (mode === 'register') {
      const nameErr = validateFullName(fullName);
      if (nameErr) newErrors.fullName = nameErr;
      
      const emailErr = validateEmail(email);
      if (emailErr) newErrors.email = emailErr;
      
      const phoneErr = validatePhoneNumber(phoneNumber);
      if (phoneErr) newErrors.phoneNumber = phoneErr;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Vui lòng kiểm tra các lỗi', 'error');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
          setUser({ id: data.id, username: data.username, role: data.role, accessToken: data.accessToken, fullName: data.fullName });
          setAuthModal(null);
          setUsername('');
          setPassword('');
          setErrors({});
          showToast(`Chào mừng ${data.fullName || data.username} quay trở lại! 🌟`);
        } else {
          showToast(data.message || 'Đăng nhập thất bại', 'error');
          setErrors({ form: data.message || 'Đăng nhập thất bại' });
        }
      } else {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            username, 
            password, 
            fullName,
            email: email.trim() || undefined,
            phoneNumber: phoneNumber.trim() || undefined
          })
        });
        const data = await res.json();
        if (res.ok) {
          showToast('Đăng ký thành công! Vui lòng đăng nhập.');
          setUsername('');
          setPassword('');
          setFullName('');
          setEmail('');
          setPhoneNumber('');
          setErrors({});
          setAuthModal('login');
        } else {
          showToast(data.message || 'Lỗi đăng ký', 'error');
          setErrors({ form: data.message || 'Lỗi đăng ký' });
        }
      }
    } catch {
      showToast('Lỗi kết nối máy chủ', 'error');
      setErrors({ form: 'Lỗi kết nối. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="auth-close" onClick={() => setAuthModal(null)}>✕</button>
        <h2 className="brand-font" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {mode === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
        </h2>
        
        {errors.form && (
          <div style={{ background: '#ef44441a', color: '#ffb3b3', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'register' && (
            <div>
              <input className="form-input" type="text" placeholder="Họ và tên" value={fullName} onChange={e => { setFullName(e.target.value); setErrors({ ...errors, fullName: '' }); }} style={{ borderColor: errors.fullName ? '#ef4444' : undefined }} />
              {errors.fullName && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.fullName}</div>}
            </div>
          )}
          {mode === 'register' && (
            <div>
              <input className="form-input" type="email" placeholder="Email liên hệ (tùy chọn)" value={email} onChange={e => { setEmail(e.target.value); setErrors({ ...errors, email: '' }); }} style={{ borderColor: errors.email ? '#ef4444' : undefined }} />
              {errors.email && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.email}</div>}
            </div>
          )}
          {mode === 'register' && (
            <div>
              <input className="form-input" type="tel" placeholder="Số điện thoại liên hệ (tùy chọn)" value={phoneNumber} onChange={e => { setPhoneNumber(e.target.value); setErrors({ ...errors, phoneNumber: '' }); }} style={{ borderColor: errors.phoneNumber ? '#ef4444' : undefined }} />
              {errors.phoneNumber && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.phoneNumber}</div>}
            </div>
          )}
          <div>
            <input className="form-input" type="text" placeholder="Tên đăng nhập (3+ ký tự)" value={username} onChange={e => { setUsername(e.target.value); setErrors({ ...errors, username: '' }); }} style={{ borderColor: errors.username ? '#ef4444' : undefined }} />
            {errors.username && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.username}</div>}
          </div>
          <div>
            <input className="form-input" type="password" placeholder="Mật khẩu (6+ ký tự, chứa chữ và số)" value={password} onChange={e => { setPassword(e.target.value); setErrors({ ...errors, password: '' }); }} style={{ borderColor: errors.password ? '#ef4444' : undefined }} />
            {errors.password && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.password}</div>}
          </div>
          <button className="btn-gold" type="submit" style={{ marginTop: '1rem', width: '100%', opacity: isLoading ? 0.6 : 1 }} disabled={isLoading}>
            {isLoading ? '⏳ Đang xử lý...' : (mode === 'register' ? 'Đăng Ký' : 'Đăng Nhập')}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#888' }}>
          {mode === 'login' ? (
            <p>Chưa có tài khoản? <span style={{ color: 'var(--accent-gold)', cursor: 'pointer', fontWeight: '500' }} onClick={() => { setAuthModal('register'); setErrors({}); }}>Đăng ký ngay</span></p>
          ) : (
             <p>Đã có tài khoản? <span style={{ color: 'var(--accent-gold)', cursor: 'pointer', fontWeight: '500' }} onClick={() => { setAuthModal('login'); setErrors({}); }}>Đăng nhập</span></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

