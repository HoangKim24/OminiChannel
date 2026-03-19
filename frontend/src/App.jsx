import React, { useState, useEffect, useRef } from 'react'
import './index.css'
import AdminDashboard from './AdminDashboard'
import AdminLogin from './components/admin/AdminLogin'

function App() {
  // === CORE STATE ===
  const [page, setPage] = useState('home') // 'home'|'detail'|'favorites'|'cart'|'checkout'
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [scrolled, setScrolled] = useState(false)

  // Auth
  const [authModal, setAuthModal] = useState(null)
  const [authForm, setAuthForm] = useState({ username: '', password: '', email: '' })

  // Cart & Nav State
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('kp_cart')) || [])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isGiftWrap, setIsGiftWrap] = useState(false)
  const [giftMessage, setGiftMessage] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Favorites
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('kp_favs')) || [])

  // Quiz State
  const [quizStep, setQuizStep] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizResults, setQuizResults] = useState([])

  // O2O & Booking State
  const [showStockModal, setShowStockModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)

  // Orders
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  // Product detail
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [detailQty, setDetailQty] = useState(1)
  const [selectedSize, setSelectedSize] = useState('50ml')
  const [engravingText, setEngravingText] = useState('')
  const [isEngravingActive, setIsEngravingActive] = useState(false)
  const [activeTab, setActiveTab] = useState('desc')
  const [comments, setComments] = useState([
    { id: 1, name: 'Ngọc Minh', stars: 5, text: 'Mùi hương sang trọng thực sự, lưu hương trên da hơn 6 tiếng. Đóng gói tinh tế. Giao hàng cực nhanh.', date: '02/03/2026', verified: true },
    { id: 2, name: 'Thảo Anh', stars: 4, text: 'Giá hơi cao nhưng rất xứng đáng với chất lượng. Mùi hương giữa rất nịnh mũi, được nhiều người khen.', date: '28/02/2026', verified: true },
    { id: 3, name: 'Hoàng Bảo', stars: 5, text: 'Mua làm quà cho bạn gái, bạn ấy rất thích! Chai thuỷ tinh đẹp lắm, xứng tầm quà tặng.', date: '15/02/2026', verified: false },
  ])
  const [newComment, setNewComment] = useState({ name: '', text: '', stars: 5 })
  const [hoverStar, setHoverStar] = useState(0)

  const [toasts, setToasts] = useState([])
  const isAdmin = (user?.role || '').toString().trim().toLowerCase() === 'admin'

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [filterGender, setFilterGender] = useState('All')
  const [filterFamily, setFilterFamily] = useState('All')
  const [filterConcentration, setFilterConcentration] = useState('All')
  const [priceRange, setPriceRange] = useState(50000000)
  const toastId = useRef(0)

  // Checkout
  const [checkoutForm, setCheckoutForm] = useState({ fullName: '', address: '', phone: '', isPickup: false })

  // Chatbot
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { from: 'bot', text: 'Xin chào! Tôi là trợ lý KP Luxury 🌸 Tôi có thể tư vấn nước hoa cho bạn. Hãy hỏi bất cứ điều gì nhé!' }
  ])
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef(null)

  // === TOAST ===
  const showToast = (message, type = 'success') => {
    const id = ++toastId.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t))
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300)
    }, 2500)
  }

  // === PERSISTENCE ===
  useEffect(() => { localStorage.setItem('kp_cart', JSON.stringify(cart)) }, [cart])
  useEffect(() => { localStorage.setItem('kp_favs', JSON.stringify(favorites)) }, [favorites])

  // === INIT ===
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) setUser(JSON.parse(savedUser))
    
    // Cross-device cart sync notification
    const existingCart = JSON.parse(localStorage.getItem('kp_cart')) || []
    if (existingCart.length > 0) {
      setTimeout(() => showToast('🛒 Giỏ hàng của bạn đã được đồng bộ', 'info'), 1000)
    }

    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    
    // Sync page state with URL path
    const path = window.location.pathname.toLowerCase();
    if (path === '/admin') {
      setPage('admin');
    }

    refreshProducts()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Ensure only admins can access the admin page
  // Removed automatic redirect to home for admin page to allow AdminLogin to show
  useEffect(() => {
    if (page === 'admin' && !isAdmin) {
      // Logic handled in render
    }
  }, [page, isAdmin])

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Scroll to top on page change
  useEffect(() => { window.scrollTo(0, 0) }, [page])

  // Fetch orders (User-specific or All for Admin)
  useEffect(() => {
    if (!user) { setOrders([]); return }
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true)
        const endpoint = user.role === 'Admin' ? '/api/orders' : `/api/orders/user/${user.id}`
        const res = await fetch(endpoint, {
          headers: { 'X-User-Role': user.role || 'User' }
        })
        if (res.ok) {
          const data = await res.json()
          setOrders(Array.isArray(data) ? data : [])
        }
      } catch (err) { console.error('Fetch Orders Error:', err) }
      finally { setLoadingOrders(false) }
    }
    fetchOrders()
  }, [user])

  const [channels, setChannels] = useState([])

  // === API ===
  const refreshProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/perfumes')
      if (res.ok) setProducts(await res.json())

      // Fetch active channels
      const resChannels = await fetch('/api/channels')
      if (resChannels.ok) {
        const data = await resChannels.json()
        setChannels(data.filter(c => c.isActive))
      }

      // If admin, also refresh all orders to sync dashboard
      if (user?.role === 'Admin') {
        const resOrders = await fetch('/api/orders', {
          headers: { 'X-User-Role': 'Admin' }
        })
        if (resOrders.ok) {
          const orderData = await resOrders.json()
          setOrders(Array.isArray(orderData) ? orderData : [])
        }
      }
    } catch (err) { console.error('Refresh Error:', err) }
    finally { setLoading(false) }
  }

  // === AUTH ===
  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data); localStorage.setItem('user', JSON.stringify(data))
        setAuthModal(null); showToast(`Xin chào ${data.username}!`)
      } else showToast(data.message || 'Đăng nhập thất bại', 'error')
    } catch (err) { showToast('Lỗi kết nối', 'error') }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...authForm, role: 'User' })
      })
      if (res.ok) { showToast('Đăng ký thành công! Hãy đăng nhập.'); setAuthModal('login') }
      else { const data = await res.json(); showToast(data.message || 'Đăng ký thất bại', 'error') }
    } catch (err) { showToast('Lỗi kết nối', 'error') }
  }

  const logout = () => {
    setUser(null); localStorage.removeItem('user')
    setPage('home'); showToast('Đã đăng xuất')
  }

  // === CART ===
  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      const newItem = { 
        id: product.id, name: product.name, price: product.price, 
        imageUrl: product.imageUrl, quantity: qty,
        engraving: isEngravingActive ? engravingText : null
      }
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + qty, engraving: newItem.engraving } : i)
      return [...prev, newItem]
    })
    showToast(`Đã thêm "${product.name}" vào giỏ hàng`)
    setIsCartOpen(true); setEngravingText(''); setIsEngravingActive(false);
  }

  const updateCartQty = (id, change) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + change) } : i))
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id))
    showToast('Đã xóa sản phẩm khỏi giỏ hàng')
  }

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const cartTax = cartTotal * 0.1
  const cartGrandTotal = cartTotal + cartTax

  // === VND FORMAT ===
  const vnd = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price * 24000)

  // === FAVORITES ===
  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      if (prev.includes(productId)) {
        showToast('Đã bỏ yêu thích'); return prev.filter(id => id !== productId)
      }
      showToast('Đã thêm vào yêu thích ❤️'); return [...prev, productId]
    })
  }

  // === PRODUCT DETAIL ===
  const openDetail = async (product) => {
    setSelectedProduct(product); setDetailQty(1)
    setSelectedSize('50ml'); setActiveTab('desc')
    setNewComment({ name: user?.username || '', text: '', stars: 5 })
    setPage('detail')
    
    // Fetch real comments
    try {
      const res = await fetch(`/api/comments/perfume/${product.id}`)
      if (res.ok) setComments(await res.json())
    } catch (err) { console.error('Error fetching comments:', err) }
  }

  const submitComment = async () => {
    if (!newComment.name.trim() || !newComment.text.trim()) { showToast('Vui lòng nhập tên và nội dung đánh giá', 'error'); return }
    const commentData = {
      perfumeId: selectedProduct.id,
      userName: newComment.name,
      text: newComment.text,
      stars: newComment.stars,
      isVerified: !!user
    }
    
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData)
      })
      if (res.ok) {
        const saved = await res.json()
        // Map backend fields to frontend if needed
        const comment = {
          id: saved.id, name: saved.userName, text: saved.text,
          stars: saved.stars, date: new Date(saved.createdAt).toLocaleDateString('vi-VN'), verified: saved.isVerified
        }
        setComments(prev => [comment, ...prev])
        setNewComment({ name: user?.username || '', text: '', stars: 5 })
        showToast('Cảm ơn bạn đã đánh giá! ⭐')
      } else {
        showToast('Lỗi gửi đánh giá', 'error')
      }
    } catch (err) { showToast('Lỗi kết nối', 'error') }
  }

  // === CHECKOUT ===
  const handleCheckout = async (e) => {
    e.preventDefault()
    if (!user) { showToast('Vui lòng đăng nhập để thanh toán', 'error'); setAuthModal('login'); return }
    if (cart.length === 0) { showToast('Giỏ hàng trống', 'error'); return }

    try {
      for (const item of cart) {
        await fetch('/api/orders', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            UserId: user.id, PerfumeId: item.id, Quantity: item.quantity,
            ShippingAddress: checkoutForm.isPickup ? 'NHẬN TẠI CỬA HÀNG' : checkoutForm.address,
            ReceiverPhone: checkoutForm.phone,
            Note: `[${checkoutForm.isPickup ? 'PICKUP' : 'DELIVERY'}] Người nhận: ${checkoutForm.fullName}`,
            IsPickup: checkoutForm.isPickup
          })
        })
      }
      setCart([]); setCheckoutForm({ fullName: '', address: '', phone: '', isPickup: false })
      showToast('🎉 Đặt hàng thành công! Cảm ơn bạn.')
      // Refresh orders
      const res = await fetch(`/api/orders/user/${user.id}`)
      if (res.ok) setOrders(await res.json())
      setPage('home')
    } catch (err) { showToast('Lỗi đặt hàng', 'error') }
  }

  // === SEARCH & FILTER ===
  const filteredProducts = products
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(p => filterGender === 'All' || p.gender === filterGender)
    .filter(p => filterFamily === 'All' || (p.description + p.name).toLowerCase().includes(filterFamily.toLowerCase()))
    .filter(p => filterConcentration === 'All' || (p.concentration && p.concentration.toLowerCase().includes(filterConcentration.toLowerCase())))
    .filter(p => p.price * 24000 <= priceRange)
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return 0
    })

  // === CHATBOT ===
  const handleSendChat = () => {
    if (!chatInput.trim()) return
    setChatMessages(prev => [...prev, { from: 'user', text: chatInput.trim() }])
    setChatInput('')
    setTimeout(() => {
      const replies = [
        'Cảm ơn bạn đã quan tâm! KP Luxury có nhiều dòng nước hoa sang trọng. Bạn thích hương hoa, hương gỗ hay hương tươi mát?',
        'Dòng nước hoa này rất được yêu thích! Bạn muốn tìm nước hoa đi tiệc hay đi làm?',
        'KP Luxury cam kết chính hãng 100%. Bạn có thể đặt hàng trực tiếp trên website hoặc qua Shopee, TikTok Shop, Lazada nhé!',
        'Nước hoa KP có độ lưu hương từ 6-8 tiếng. Bạn muốn tôi tư vấn thêm về cách bảo quản không?',
        'Hiện KP Luxury đang có chương trình giảm 20% cho khách hàng mới. Bạn muốn xem sản phẩm nào không?'
      ]
      setChatMessages(prev => [...prev, { from: 'bot', text: replies[Math.floor(Math.random() * replies.length)] }])
    }, 800)
  }

  // === FRAGRANCE QUIZ ===
  const quizQuestions = [
    { id: 'gender', q: 'Bạn tìm nước hoa cho ai?', options: [['Nam', '👨 Nam'], ['Nữ', '👩 Nữ'], ['Unisex', '✨ Cả hai']] },
    { id: 'mood', q: 'Phong cách bạn hướng tới?', options: [['tươi mát', '🌊 Tươi mát'], ['sang trọng', '💎 Sang trọng'], ['quyến rũ', '🔥 Quyến rũ'], ['ấm áp', '🪵 Ấm áp']] },
    { id: 'intensity', q: 'Độ nồng nàn mong muốn?', options: [['nhẹ nhàng', '🌸 Nhẹ nhàng'], ['vừa phải', '💫 Vừa phải'], ['nồng nàn', '🌟 Mãnh liệt']] }
  ]

  const handleQuizAnswer = (id, val) => {
    const newAnsw = { ...quizAnswers, [id]: val }
    setQuizAnswers(newAnsw)
    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(prev => prev + 1)
    } else {
      // Calculate results
      const matches = products.filter(p => {
        let score = 0
        if (p.gender === newAnsw.gender || newAnsw.gender === 'Unisex') score += 40
        const descMatch = p.description?.toLowerCase() || ''
        if (descMatch.includes(newAnsw.mood)) score += 30
        if (p.concentration?.toLowerCase().includes('parfum') && newAnsw.intensity === 'nồng nàn') score += 30
        if (p.concentration?.toLowerCase().includes('eau de toilette') && newAnsw.intensity === 'nhẹ nhàng') score += 30
        p.matchScore = score
        return score > 0
      }).sort((a,b) => b.matchScore - a.matchScore).slice(0, 3)
      setQuizResults(matches)
      setQuizStep(100)
    }
  }

  const resetQuiz = () => {
    setQuizStep(0); setQuizAnswers({}); setQuizResults([]); setPage('quiz')
  }

  // ===========================
  //          RENDER
  // ===========================
  return (
    <div className="app">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type} ${t.removing ? 'removing' : ''}`}>
            <span className="toast-icon">{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
            {t.message}
          </div>
        ))}
      </div>

      {/* === NAVBAR (Store Only) === */}
      {page !== 'admin' && (
        <nav className={scrolled ? 'scrolled' : ''}>
        <div className="container">
          <a href="#" className="logo" onClick={e => { e.preventDefault(); setPage('home') }}>KP LUXURY</a>
          <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>☰</button>
          
          <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            
            <div className="nav-search-container">
              <input type="text" className="nav-search-input" placeholder="🔍 Tìm kiếm..." value={searchTerm} 
                     onFocus={() => setIsSearchOpen(true)} 
                     onChange={e => { setSearchTerm(e.target.value); if(page !== 'home') setPage('home') }} />
              {searchTerm && isSearchOpen && (
                <div className="search-suggest-dropdown" onMouseLeave={() => setIsSearchOpen(false)}>
                  {filteredProducts.slice(0, 5).map(p => (
                    <div key={p.id} className="suggest-item" onClick={() => { openDetail(p); setIsSearchOpen(false); setSearchTerm(''); setIsMobileMenuOpen(false); }}>
                      <img src={p.imageUrl} alt={p.name} />
                      <div className="suggest-info">
                        <h4>{p.name}</h4>
                        <p>{vnd(p.price)}</p>
                      </div>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && <div style={{ padding: '1rem', color: '#888' }}>Không tìm thấy sản phẩm.</div>}
                </div>
              )}
            </div>

            <a href="#" onClick={e => { e.preventDefault(); resetQuiz(); setIsMobileMenuOpen(false); }}>Fragrance Finder</a>
            <a href="#" onClick={e => { e.preventDefault(); setPage('home'); setIsMobileMenuOpen(false); }}>Bộ Sưu Tập</a>
            <a href="#" onClick={e => { e.preventDefault(); setPage('favorites'); setIsMobileMenuOpen(false); }}>
              ❤️ Yêu Thích ({favorites.length})
            </a>
            {/* Removed Admin link from public navigation as requested */}
            {user ? (
              <>
                <span style={{ color: 'var(--accent-gold)', marginLeft: '1.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  Chào, {user.username}
                </span>
                <a href="#" onClick={e => { e.preventDefault(); logout(); setIsMobileMenuOpen(false); }}>Đăng Xuất</a>
              </>
            ) : (
              <a href="#" onClick={e => { e.preventDefault(); setAuthModal('login'); setIsMobileMenuOpen(false); }}>Đăng Nhập</a>
            )}
            <a href="#" onClick={e => { e.preventDefault(); setIsCartOpen(true); setIsMobileMenuOpen(false); }}>
              🛒 Giỏ Hàng ({cart.reduce((a, b) => a + b.quantity, 0)})
            </a>
          </div>
        </div>
      </nav>
      )}

      {/* === AUTH MODAL === */}
      <div className={`modal-overlay ${authModal ? 'active' : ''}`} onClick={() => setAuthModal(null)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="cart-close" onClick={() => setAuthModal(null)} style={{ position: 'absolute', top: '1rem', right: '1.5rem' }}>&times;</button>
          <form className="auth-form" onSubmit={authModal === 'login' ? handleLogin : handleRegister}>
            <h2 className="brand-font">{authModal === 'login' ? 'Chào Mừng Trở Lại' : 'Tạo Tài Khoản'}</h2>
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input type="text" required value={authForm.username} onChange={e => setAuthForm({ ...authForm, username: e.target.value })} />
            </div>
            {authModal === 'register' && (
              <div className="form-group">
                <label>Địa chỉ Email</label>
                <input type="email" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} />
              </div>
            )}
            <div className="form-group">
              <label>Mật khẩu</label>
              <input type="password" required value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} />
            </div>
            <button className="btn-gold" style={{ width: '100%', marginTop: '1rem' }}>
              {authModal === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
            </button>
            <div className="auth-switch">
              {authModal === 'login' ? (
                <>Chưa có tài khoản? <span onClick={() => setAuthModal('register')}>Đăng ký ngay</span></>
              ) : (
                <>Đã có tài khoản? <span onClick={() => setAuthModal('login')}>Đăng nhập</span></>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ============================================================ */}
      {/*                      PAGE: HOME                              */}
      {/* ============================================================ */}
      {page === 'home' && (
        <>
          {/* Hero */}
          <div className="hero">
            <div className="hero-content">
              <p>Nghệ Thuật Của Hương Thơm Vượt Thời Gian</p>
              <h1>Tinh Hoa Nước Hoa Cao Cấp</h1>
              <a href="#products" className="btn-gold">Khám Phá Ngay</a>
            </div>
          </div>

          {/* Products */}
          <section id="products" className="products-section">
            <div className="container">
              <h2 className="section-title">
                <span>Tuyển Chọn Đặc Biệt</span>
                Bộ Sưu Tập Kiệt Tác
              </h2>

              {/* Search & Filter */}
              <div className="search-filter-bar">
                <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="default">Sắp xếp mặc định</option>
                  <option value="price-asc">Giá: Thấp → Cao</option>
                  <option value="price-desc">Giá: Cao → Thấp</option>
                  <option value="name">Tên: A → Z</option>
                </select>
                <select className="filter-select" value={filterGender} onChange={e => setFilterGender(e.target.value)}>
                  <option value="all">Tất cả giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>

              {loading ? (
                <div className="product-grid">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="skeleton-card">
                      <div className="skeleton-box skeleton-img"></div>
                      <div className="skeleton-box skeleton-text"></div>
                      <div className="skeleton-box skeleton-price"></div>
                      <div className="skeleton-box skeleton-btn"></div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#888' }}>Không tìm thấy sản phẩm phù hợp.</p>
              ) : (
                <div className="product-grid">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="product-card">
                      <div className="product-image-container" onClick={() => openDetail(product)}>
                        <img src={product.imageUrl} alt={product.name} className="product-image" loading="lazy" />
                        <img src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400" alt="lifestyle" className="product-image-hover" loading="lazy" />
                        <div className="card-actions">
                          <button className={`icon-btn ${favorites.includes(product.id) ? 'active' : ''}`}
                            onClick={e => { e.stopPropagation(); toggleFavorite(product.id) }}>♥</button>
                        </div>
                      </div>
                      <div className="product-info">
                        <h3 style={{ cursor: 'pointer' }} onClick={() => openDetail(product)}>{product.name}</h3>
                        <p className="product-price">{vnd(product.price)}</p>
                        <button className="add-to-cart-btn" onClick={() => addToCart(product)}>Thêm Vào Giỏ</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Sales Channels Section */}
          <section className="products-section" style={{ background: '#080808', borderTop: '1px solid var(--glass-border)' }}>
            <div className="container">
              <h2 className="section-title">
                <span>Trải Nghiệm Đa Kênh</span>
                Kênh Bán Hàng Trực Tuyến
              </h2>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
                {channels.map(channel => (
                  <div key={channel.id} style={{ textAlign: 'center', transition: 'transform 0.3s', cursor: 'pointer' }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                    <img src={channel.channelName === 'Lazada' ? 'https://upload.wikimedia.org/wikipedia/commons/d/df/Lazada_Logo.png' : channel.logoUrl} 
                      alt={channel.channelName} style={{ width: '64px', height: '64px', marginBottom: '1rem', objectFit: 'contain' }} 
                      onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${channel.channelName}&background=222&color=c5a059` }} />
                    <p style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', fontWeight: 600 }}>{channel.channelName}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Order History */}
          {user && (
            <section className="products-section" style={{ paddingTop: 0 }}>
              <div className="container">
                <h2 className="section-title">
                  <span>Hành Trình Của Bạn</span>
                  Lịch Sử Đơn Hàng
                </h2>
                {loadingOrders ? (
                  <div className="loading-state"><p>Đang tải đơn hàng...</p></div>
                ) : orders.length === 0 ? (
                  <p style={{ color: '#888', textAlign: 'center' }}>Bạn chưa có đơn hàng nào.</p>
                ) : (
                  <div style={{ display: 'grid', gap: '2rem' }}>
                    {orders.map(order => {
                      const items = order.items || order.Items || []
                      const total = order.totalAmount ?? order.TotalAmount ?? 0
                      return (
                        <div key={order.id} className="product-card">
                          <div className="product-info" style={{ textAlign: 'left' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                              <h3 className="brand-font">Đơn hàng #{order.id}</h3>
                              <span style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', padding: '0.2rem 0.8rem', background: '#222', borderRadius: '12px' }}>
                                {order.status || order.Status}
                              </span>
                            </div>
                            <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                              {order.orderDate ? new Date(order.orderDate).toLocaleString('vi-VN') : ''}
                            </p>
                            <p style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', fontWeight: 600 }}>{vnd(total)}</p>
                            {items.length > 0 && (
                              <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop: '0.75rem', color: '#aaa', fontSize: '0.9rem' }}>
                                {items.map((item, i) => (
                                  <li key={i}>{item.perfumeName || item.PerfumeName} · SL: {item.quantity || item.Quantity} · {vnd(item.price || item.Price || 0)}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}

      {/* ============================================================ */}
      {/*                    PAGE: PRODUCT DETAIL                       */}
      {/* ============================================================ */}
      {page === 'detail' && selectedProduct && (() => {
        const avgRating = comments.length ? (comments.reduce((s, c) => s + c.stars, 0) / comments.length) : 4.8
        const starCounts = [5, 4, 3, 2, 1].map(s => ({ s, count: comments.filter(c => c.stars === s).length }))
        const related = products.filter(p => p.id !== selectedProduct.id && (p.categoryId === selectedProduct.categoryId || p.gender === selectedProduct.gender)).slice(0, 4)
        const sizes = ['30ml', '50ml', '100ml']
        const sizePrices = { '30ml': 0.7, '50ml': 1, '100ml': 1.6 }
        const currentPrice = selectedProduct.price * (sizePrices[selectedSize] || 1)
        const stockQty = selectedProduct.stockQuantity ?? 0
        const stockStatus = stockQty === 0 ? 'out' : stockQty <= 10 ? 'low' : 'in'

        return (
          <div className="detail-page">
            <div className="container">
              {/* Breadcrumb */}
              <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
                <a href="#" onClick={e => { e.preventDefault(); setPage('home') }} style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>Trang Chủ</a>
                <span style={{ color: '#555' }}>›</span>
                <a href="#" onClick={e => { e.preventDefault(); setPage('home') }} style={{ color: '#888', textDecoration: 'none' }}>Bộ Sưu Tập</a>
                <span style={{ color: '#555' }}>›</span>
                <span style={{ color: '#aaa' }}>{selectedProduct.name}</span>
              </div>

              <div className="detail-layout">
                {/* Gallery with Engraving Preview */}
                <div className="detail-gallery">
                  <div className="bottle-preview-container">
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="detail-main-img"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800' }} />
                    {isEngravingActive && engravingText && (
                      <div className="engraving-overlay">{engravingText}</div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="detail-info">
                  <div className="detail-brand">{selectedProduct.brand || 'KP LUXURY'}</div>
                  <h1>{selectedProduct.name}</h1>

                  <div className="detail-rating">
                    {'★'.repeat(Math.floor(avgRating))}{'☆'.repeat(5 - Math.floor(avgRating))}
                    <span>{avgRating.toFixed(1)}/5 từ {comments.length} đánh giá</span>
                  </div>

                  {/* Stock */}
                  <div className={`stock-badge ${stockStatus === 'in' ? 'in-stock' : stockStatus === 'low' ? 'low-stock' : 'out-stock'}`}>
                    {stockStatus === 'in' && '● Còn hàng'}
                    {stockStatus === 'low' && `⚠ Sắp hết hàng · Còn ${stockQty} sản phẩm`}
                    {stockStatus === 'out' && '✕ Hết hàng'}
                  </div>

                  {/* Meta tags */}
                  <div className="detail-meta">
                    {selectedProduct.gender && <span className="meta-tag">{selectedProduct.gender}</span>}
                    {selectedProduct.category?.categoryName && <span className="meta-tag">{selectedProduct.category.categoryName}</span>}
                    <span className="meta-tag">Eau de Parfum</span>
                    <span className="meta-tag">Chính Hãng</span>
                  </div>

                  {/* Price */}
                  <div className="detail-price-wrap">
                    <span className="detail-current-price">{vnd(currentPrice)}</span>
                    <span className="detail-old-price">{vnd(currentPrice * 1.25)}</span>
                    <span className="detail-discount">-20%</span>
                  </div>

                  {/* ML Size */}
                  <div className="size-selector">
                    <label>Dung tích</label>
                    <div className="size-options">
                      {sizes.map(sz => (
                        <button key={sz} className={`size-btn ${selectedSize === sz ? 'active' : ''}`} onClick={() => setSelectedSize(sz)}>
                          {sz}
                          {sz === '50ml' && <span style={{ display: 'block', fontSize: '0.7rem', opacity: 0.7 }}>Phổ biến</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fragrance Notes */}
                  <div className="fragrance-notes">
                    <h4>🌸 Tầng Hương Trực Quan</h4>
                    <div className="notes-pyramid">
                      {[
                        { l: 'Hương đầu', n: selectedProduct.topNotes, i: '💨', t: 'Hương thơm lan tỏa ngay lập tức, lưu lại từ 15-30 phút đầu.' },
                        { l: 'Hương giữa', n: selectedProduct.middleNotes, i: '🌹', t: 'Linh hồn của nước hoa, thể hiện rõ nhất sau khi hương đầu nhạt đi.' },
                        { l: 'Hương cuối', n: selectedProduct.baseNotes, i: '🪵', t: 'Điểm tựa trầm ấm, lưu lại lâu nhất trên da suốt nhiều giờ.' }
                      ].map((layer, idx) => (
                        <div key={idx} className="note-layer" title={layer.t}>
                          <div className="note-icon">{layer.i}</div>
                          <div className="note-label">{layer.l}</div>
                          <div className="note-name">{layer.n || 'Đang cập nhật...'}</div>
                          <div className="note-tooltip">{layer.t}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Engraving Service */}
                  <div className="engraving-service">
                    <label className="checkbox-label">
                      <input type="checkbox" checked={isEngravingActive} onChange={e => setIsEngravingActive(e.target.checked)} />
                      <span>🖋️ Dịch vụ khắc tên lên sản phẩm (Miễn phí)</span>
                    </label>
                    {isEngravingActive && (
                      <div className="engraving-input-wrap fade-in">
                        <input type="text" maxLength="15" placeholder="Nhập tên bạn muốn khắc..."
                          value={engravingText} onChange={e => setEngravingText(e.target.value)} />
                        <p style={{ fontSize: '0.7rem', color: '#888', marginTop: '0.5rem' }}>Tối đa 15 ký tự. Ví dụ: "Kim Hoang", "Love"...</p>
                      </div>
                    )}
                  </div>

                  {/* Info Tabs */}
                  <div className="info-tabs">
                    <div className="tab-headers">
                      {[['desc', 'Mô Tả'], ['spec', 'Chi Tiết'], ['brand', 'Thương Hiệu']].map(([key, label]) => (
                        <button key={key} className={`tab-header-btn ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>{label}</button>
                      ))}
                    </div>
                    <div className="tab-content">
                      {activeTab === 'desc' && (
                        <p style={{ lineHeight: 1.8 }}>{selectedProduct.description || 'Một tuyệt tác mùi hương sang trọng, kết hợp hoàn hảo giữa các tầng hương tạo nên trải nghiệm khứu giác đẳng cấp. Lấy cảm hứng từ sự thanh lịch đương đại, phù hợp cho mọi dịp từ công sở đến dạ tiệc.'}</p>
                      )}
                      {activeTab === 'spec' && (
                        <table className="spec-table">
                          <tbody>
                            <tr><td>Thương hiệu</td><td>{selectedProduct.brand || 'KP Luxury'}</td></tr>
                            <tr><td>Dung tích</td><td>{selectedSize}</td></tr>
                            <tr><td>Giới tính</td><td>{selectedProduct.gender || 'Unisex'}</td></tr>
                            <tr><td>Nồng độ</td><td>{selectedProduct.concentration || 'Eau de Parfum (EDP)'}</td></tr>
                            <tr><td>Độ lưu hương</td><td>6 – 8 giờ</td></tr>
                            <tr><td>Xuất xứ</td><td>{selectedProduct.origin || 'Pháp'}</td></tr>
                            <tr><td>Mã sản phẩm</td><td>KP-{selectedProduct.id?.toString().padStart(4, '0')}</td></tr>
                          </tbody>
                        </table>
                      )}
                      {activeTab === 'brand' && (
                        <div>
                          <p style={{ lineHeight: 1.8 }}>
                            <strong style={{ color: 'var(--accent-gold)' }}>KP Luxury</strong> {selectedProduct.brandStory || 'được sáng lập vào năm 2010 bởi chuyên gia hương thơm người Việt, với triết lý "Tinh hoa nghệ thuật, bền vững theo thời gian". Mỗi sản phẩm được tạo ra từ nguyên liệu thiên nhiên cao cấp nhập khẩu từ Grasse, Pháp.'}
                          </p>
                          <p style={{ color: '#888', marginTop: '0.75rem', lineHeight: 1.8, fontSize: '0.9rem' }}>
                            Hiện có mặt tại 50+ quốc gia · Đạt chứng nhận IFRA · Không thử nghiệm trên động vật
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="detail-qty">
                    <label>Số lượng</label>
                    <div className="detail-qty-wrap">
                      <button className="detail-qty-btn" onClick={() => setDetailQty(q => Math.max(1, q - 1))}>−</button>
                      <input className="detail-qty-input" type="number" value={detailQty} readOnly />
                      <button className="detail-qty-btn" onClick={() => setDetailQty(q => q + 1)}>+</button>
                    </div>
                    {stockQty > 0 && <span style={{ color: '#666', fontSize: '0.8rem' }}>Còn {stockQty} sp</span>}
                  </div>

                  {/* Actions */}
                  <div className="detail-actions">
                    <button className="btn-add-cart-detail" onClick={() => addToCart(selectedProduct, detailQty)} disabled={stockStatus === 'out'}>
                      🛒 Thêm Vào Giỏ
                    </button>
                    <button className="btn-buy-now" onClick={() => { addToCart(selectedProduct, detailQty); setPage('checkout') }} disabled={stockStatus === 'out'}>
                      ⚡ Mua Ngay
                    </button>
                    <button className="btn-store-pickup" onClick={() => { setCheckoutForm(prev => ({ ...prev, isPickup: true })); addToCart(selectedProduct, detailQty); setPage('checkout') }} disabled={stockStatus === 'out'}>
                      🏪 Nhận Tại Cửa Hàng
                    </button>
                    <button className="btn-secondary" style={{ width: '100%', marginTop: '0.5rem', background: 'transparent', border: '1px solid #333' }}
                      onClick={() => setShowStockModal(true)}>
                      📍 Kiểm tra tồn kho tại cửa hàng
                    </button>
                    <button className="btn-secondary" style={{ width: '100%', marginTop: '0.5rem', background: 'transparent', border: '1px solid #333' }}
                      onClick={() => setShowBookingModal(true)}>
                      📅 Đặt lịch thử mùi tại Showroom
                    </button>
                  </div>

                  {/* Discovery Sets Cross-sell */}
                  <div className="discovery-cross-sell" style={{ marginTop: '2.5rem', padding: '1.5rem', border: '1px dashed var(--accent-gold)', borderRadius: '8px', background: 'rgba(197,160,89,0.05)' }}>
                    <h4 style={{ color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>🎁 Trải nghiệm trước khi mua Full-size?</h4>
                    <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem' }}>Sở hữu bộ Discovery Set (3 ống 2ml) chỉ với 250.000đ. Nhận Voucher hoàn tiền 250k cho đơn hàng Full-size sau này.</p>
                    <button className="btn-gold" style={{ width: '100%', padding: '0.8rem', fontSize: '0.8rem' }} onClick={() => showToast('Đã thêm Bộ mẫu thử vào giỏ hàng!')}>Mua Bộ Mẫu Thử</button>
                  </div>

                  {/* Channel Listing */}
                  {channels.filter(c => c.channelName !== 'Website').length > 0 && (
                    <div className="channel-listing">
                      <p>Cũng có sẵn tại các kênh:</p>
                      <div className="channel-logos">
                        {channels.filter(c => c.channelName !== 'Website').map(c => (
                          <a key={c.id} href="#" className="channel-logo-link" onClick={e => { e.preventDefault(); showToast(`Đang chuyển đến ${c.channelName}...`, 'info') }}>
                            <img src={c.logoUrl} alt={c.channelName}
                              onError={e => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.channelName)}&background=222&color=c5a059&size=36` }} />
                            <span>{c.channelName}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Guarantees */}
                  <div className="detail-guarantees">
                    <h3 style={{ marginBottom: '1rem', color: 'var(--accent-gold)', fontSize: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                      Cam Kết Dịch Vụ
                    </h3>
                    {[
                      ['🏪', 'Click & Collect', 'Đặt online, nhận tại 15 showroom toàn quốc'],
                      ['🚀', 'Giao Hàng 2H', 'Nội thành TP.HCM và Hà Nội'],
                      ['🔄', 'Đổi Trả 30 Ngày', 'Không cần lý do trong 30 ngày đầu'],
                      ['🛡️', 'Chính Hãng 100%', 'Hoàn tiền 200% nếu phát hiện hàng giả'],
                    ].map(([icon, title, desc]) => (
                      <div key={title} className="guarantee-item">
                        <span className="guarantee-icon">{icon}</span>
                        <div>
                          <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{title}</strong>
                          <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.15rem' }}>{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="review-section">
                <h2 className="brand-font" style={{ fontSize: '1.8rem', marginBottom: '2rem', textAlign: 'center' }}>Đánh Giá Khách Hàng</h2>

                {/* Summary */}
                <div className="review-summary">
                  <div className="review-score">
                    <div className="big-score">{avgRating.toFixed(1)}</div>
                    <div className="stars-big">{'★'.repeat(Math.round(avgRating))}</div>
                    <div style={{ color: '#666', fontSize: '0.85rem' }}>{comments.length} đánh giá</div>
                  </div>
                  <div className="review-bars">
                    {starCounts.map(({ s, count }) => (
                      <div key={s} className="bar-row">
                        <span>{s}</span>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: comments.length ? `${(count / comments.length) * 100}%` : '0%' }} />
                        </div>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comment Form */}
                <div className="comment-form">
                  <h3>✍️ Viết Đánh Giá Của Bạn</h3>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Số sao</div>
                    <div className="star-picker">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} className={`star-pick ${s <= (hoverStar || newComment.stars) ? 'lit' : ''}`}
                          onMouseEnter={() => setHoverStar(s)} onMouseLeave={() => setHoverStar(0)}
                          onClick={() => setNewComment(c => ({ ...c, stars: s }))}>★</button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Họ tên</label>
                    <input type="text" value={newComment.name || (user?.username || '')}
                      onChange={e => setNewComment(c => ({ ...c, name: e.target.value }))}
                      placeholder="Nhập tên của bạn..." />
                  </div>
                  <textarea className="comment-input" placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                    value={newComment.text} onChange={e => setNewComment(c => ({ ...c, text: e.target.value }))} />
                  <button className="comment-submit" onClick={submitComment}>Gửi Đánh Giá ⭐</button>
                </div>

                {/* Comment List */}
                {comments.map(c => (
                  <div key={c.id} className="review-item">
                    <div className="review-stars">{'★'.repeat(c.stars)}{'☆'.repeat(5 - c.stars)}</div>
                    <div className="review-meta">
                      <span>{c.name}</span> · <span>{c.date}</span>
                      {c.verified && <span className="verified-badge">✓ Đã mua hàng</span>}
                    </div>
                    {(c.longevity !== undefined || c.sillage !== undefined) && (
                      <div className="review-performance" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--accent-gold)' }}>
                         <span>⏱️ Lưu hương: {['Tệ', 'Kém', 'Trung bình', 'Lâu', 'Rất lâu'][c.longevity || 2]}</span>
                         <span>🌬️ Tỏa hương: {['Sát da', 'Gần', 'Trung bình', 'Xa', 'Cực xa'][c.sillage || 2]}</span>
                      </div>
                    )}
                    <p className="review-text">{c.text}</p>
                  </div>
                ))}
              </div>

              {/* Related Products */}
              {related.length > 0 && (
                <div className="related-section">
                  <h2 className="brand-font">
                    <span>Có Thể Bạn Muốn</span>
                    Sản Phẩm Liên Quan
                  </h2>
                  <div className="related-grid">
                    {related.map(p => (
                      <div key={p.id} className="related-card" onClick={() => openDetail(p)}>
                        <img src={p.imageUrl} alt={p.name}
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=400' }} />
                        <div className="related-card-info">
                          <h3>{p.name}</h3>
                          <p>{vnd(p.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
            
            {/* Sticky Mobile Add To Cart */}
            <div className={`sticky-cart-mobile ${scrolled ? 'visible' : ''}`}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{selectedProduct.name}</div>
                <div className="price">{vnd(currentPrice)}</div>
              </div>
              <button onClick={() => addToCart(selectedProduct, detailQty)} disabled={stockStatus === 'out'}>🛒 Thêm Vào Giỏ</button>
            </div>
          </div>
        )
      })()}



      {/* ============================================================ */}
      {/*                    PAGE: FAVORITES                            */}
      {/* ============================================================ */}
      {page === 'favorites' && (
        <section className="products-section" style={{ paddingTop: '8rem' }}>
          <div className="container">
            <h2 className="section-title">
              <span>Bộ Sưu Tập Cá Nhân</span>
              ❤️ Sản Phẩm Yêu Thích
            </h2>
            {favorites.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: '#111', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>💔</p>
                <h3 className="brand-font">Chưa có mục yêu thích</h3>
                <p style={{ color: '#888', margin: '1rem 0 2rem' }}>Hãy thả tim cho những hương thơm bạn yêu thích nhất.</p>
                <button className="btn-gold" onClick={() => setPage('home')}>Khám phá ngay</button>
              </div>
            ) : (
              <div className="product-grid">
                {products.filter(p => favorites.includes(p.id)).map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-image-container" onClick={() => openDetail(product)}>
                      <img src={product.imageUrl} alt={product.name} className="product-image" />
                      <div className="card-actions">
                        <button className="icon-btn active" onClick={e => { e.stopPropagation(); toggleFavorite(product.id) }}>♥</button>
                      </div>
                    </div>
                    <div className="product-info">
                      <h3 style={{ cursor: 'pointer' }} onClick={() => openDetail(product)}>{product.name}</h3>
                      <p className="product-price">${product.price.toFixed(2)}</p>
                      <button className="add-to-cart-btn" onClick={() => addToCart(product)}>Thêm Vào Giỏ</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/*                    PAGE: FRAGRANCE QUIZ                      */}
      {/* ============================================================ */}
      {page === 'quiz' && (
        <section className="quiz-page" style={{ paddingTop: '8rem', minHeight: '100vh', background: 'var(--bg-dark)' }}>
          <div className="container" style={{ maxWidth: '800px' }}>
            <h2 className="section-title">
              <span>Trợ Lý Cá Nhân</span>
              Fragrance Finder
            </h2>
            
            <div className="quiz-card" style={{ background: '#111', border: '1px solid var(--glass-border)', padding: '3rem', borderRadius: '12px', textAlign: 'center' }}>
              {quizStep < quizQuestions.length ? (
                <div key={quizStep} className="fade-in">
                  <p style={{ color: 'var(--accent-gold)', marginBottom: '1rem', letterSpacing: '2px' }}>CÂU HỎI {quizStep + 1}/{quizQuestions.length}</p>
                  <h3 className="brand-font" style={{ fontSize: '2rem', marginBottom: '2.5rem' }}>{quizQuestions[quizStep].q}</h3>
                  <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                    {quizQuestions[quizStep].options.map(([val, label]) => (
                      <button key={val} className="btn-gold" style={{ background: 'transparent', border: '1px solid #333', color: '#fff' }}
                        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
                        onMouseOut={e => e.currentTarget.style.borderColor = '#333'}
                        onClick={() => handleQuizAnswer(quizQuestions[quizStep].id, val)}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="fade-in">
                  <h3 className="brand-font" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Sản Phẩm Dành Cho Bạn</h3>
                  <p style={{ color: '#888', marginBottom: '3rem' }}>Dựa trên sở thích cá nhân, đây là những mùi hương chúng tôi gợi ý:</p>
                  <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
                    {quizResults.map(p => (
                      <div key={p.id} className="product-card" style={{ padding: '0.5rem' }}>
                        <div className="product-image-container" onClick={() => openDetail(p)} style={{ aspectRatio: '1/1', marginBottom: '1rem' }}>
                          <img src={p.imageUrl} alt={p.name} className="product-image" />
                        </div>
                        <h4 className="brand-font">{p.name}</h4>
                        <p style={{ color: 'var(--accent-gold)', fontSize: '0.9rem' }}>{p.matchScore}% Phù Hợp</p>
                        <button className="btn-gold" style={{ width: '100%', padding: '0.6rem', marginTop: '1rem', fontSize: '0.75rem' }} onClick={() => openDetail(p)}>Chi Tiết</button>
                      </div>
                    ))}
                  </div>
                  <button className="btn-gold" style={{ marginTop: '4rem' }} onClick={() => resetQuiz()}>Làm Lại Trắc Nghiệm</button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/*                     PAGE: CART                                */}
      {/* ============================================================ */}
      {page === 'cart' && (
        <div className="cart-page">
          <div className="container">
            <h1 className="brand-font" style={{ color: 'var(--accent-gold)', marginBottom: '2rem' }}>🛒 Giỏ Hàng Của Bạn</h1>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: '#111', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</p>
                <h3 className="brand-font">Giỏ hàng trống</h3>
                <p style={{ color: '#888', margin: '1rem 0 2rem' }}>Chưa có sản phẩm nào trong giỏ hàng của bạn.</p>
                <button className="btn-gold" onClick={() => setPage('home')}>Khám phá ngay</button>
              </div>
            ) : (
              <div className="cart-page-layout">
                <div className="cart-page-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-page-item">
                      <img src={item.imageUrl} alt={item.name} />
                      <div className="cart-item-details">
                        <h3 className="cart-item-title">{item.name}</h3>
                        <div className="cart-item-price">{vnd(item.price)}</div>
                        <div className="qty-controls">
                          <button className="qty-btn-sm" onClick={() => updateCartQty(item.id, -1)}>−</button>
                          <span>{item.quantity}</span>
                          <button className="qty-btn-sm" onClick={() => updateCartQty(item.id, 1)}>+</button>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '1rem', color: 'var(--accent-gold)' }}>
                          {vnd(item.price * item.quantity)}
                        </div>
                        <button className="btn-remove" onClick={() => removeFromCart(item.id)}>🗑 Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-summary-box">
                  <h2 className="brand-font" style={{ marginBottom: '1.5rem', color: 'var(--accent-gold)' }}>Tổng Đơn Hàng</h2>
                  <div className="summary-row"><span>Tạm tính</span><span>{vnd(cartTotal)}</span></div>
                  <div className="summary-row"><span>Thuế (10%)</span><span>{vnd(cartTax)}</span></div>
                  <div className="summary-row summary-total">
                    <span>Thành tiền</span>
                    <span style={{ color: 'var(--accent-gold)' }}>{vnd(cartGrandTotal)}</span>
                  </div>
                  <button className="btn-gold" style={{ width: '100%', marginTop: '2rem' }} onClick={() => {
                    if (!user) { showToast('Vui lòng đăng nhập để thanh toán', 'error'); setAuthModal('login'); return }
                    setPage('checkout')
                  }}>Tiến hành thanh toán</button>
                  <button onClick={() => setPage('home')} style={{ width: '100%', marginTop: '1rem', background: 'none', border: '1px solid #444', color: '#fff', padding: '1rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>
                    Tiếp tục mua sắm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*                    PAGE: CHECKOUT                             */}
      {/* ============================================================ */}
      {page === 'checkout' && (
        <div className="checkout-page">
          <div className="container">
            <div className="checkout-layout">
              <div className="checkout-form-section">
                <h2 className="brand-font">Thông Tin Giao Hàng</h2>
                <form onSubmit={handleCheckout}>
                  <div className="form-group">
                    <label>Họ và tên</label>
                    <input type="text" required value={checkoutForm.fullName} onChange={e => setCheckoutForm({ ...checkoutForm, fullName: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Địa chỉ</label>
                    <input type="text" required={!checkoutForm.isPickup} disabled={checkoutForm.isPickup}
                      placeholder={checkoutForm.isPickup ? 'Sẽ nhận tại cửa hàng' : 'Nhập địa chỉ giao hàng...'}
                      value={checkoutForm.isPickup ? '' : checkoutForm.address} 
                      onChange={e => setCheckoutForm({ ...checkoutForm, address: e.target.value })} />
                  </div>
                  <label className="checkbox-label" style={{ marginBottom: '1.5rem' }}>
                    <input type="checkbox" checked={checkoutForm.isPickup} 
                      onChange={e => setCheckoutForm(p => ({ ...p, isPickup: e.target.checked }))} />
                    <span>🏪 Nhận tại cửa hàng (Miễn phí vận chuyển)</span>
                  </label>

                  {checkoutForm.isPickup && (
                    <div className="form-group fade-in" style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--accent-gold)', borderRadius: '4px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', display: 'block', marginBottom: '0.5rem' }}>CHỌN CHI NHÁNH NHẬN HÀNG</label>
                      <select className="form-input" style={{ width: '100%' }}>
                        <option>KP Luxury Quận 1 - 123 Lê Lợi, HCM</option>
                        <option>KP Luxury Hoàn Kiếm - 45 Hàng Bài, HN</option>
                        <option>KP Luxury Đà Nẵng - 89 Bạch Đằng, ĐN</option>
                      </select>
                    </div>
                  )}
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input type="text" required value={checkoutForm.phone} onChange={e => setCheckoutForm({ ...checkoutForm, phone: e.target.value })} />
                  </div>
                  <button type="submit" className="btn-gold" style={{ width: '100%', marginTop: '2rem' }}>Xác Nhận Đặt Hàng</button>
                  <button type="button" onClick={() => setPage('cart')} style={{ width: '100%', marginTop: '1rem', background: 'none', border: '1px solid #444', color: '#fff', padding: '1rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>
                    ← Quay lại giỏ hàng
                  </button>
                </form>
              </div>
              <div className="checkout-summary">
                <h3 className="brand-font">Tóm Tắt Đơn Hàng</h3>
                {cart.map(item => (
                  <div key={item.id} className="checkout-summary-item">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{vnd(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="checkout-total">
                  <span>Tổng:</span>
                  <span style={{ color: 'var(--accent-gold)' }}>{vnd(cartGrandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === CART SIDEBAR (quick view) === */}
      <div className={`cart-overlay ${isCartOpen ? 'active' : ''}`} onClick={() => setIsCartOpen(false)}></div>
      <div className={`cart-sidebar ${isCartOpen ? 'active' : ''}`}>
        <div className="cart-header">
          <h2 className="brand-font">Giỏ Hàng</h2>
          <button className="cart-close" onClick={() => setIsCartOpen(false)}>&times;</button>
        </div>
        <div className="cart-items" style={{ flex: 1, overflowY: 'auto' }}>
          {cart.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', marginTop: '2rem' }}>Giỏ hàng trống.</p>
          ) : cart.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #222', paddingBottom: '1rem' }}>
              <img src={item.imageUrl} alt={item.name} style={{ width: '60px', height: '75px', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <h4 className="brand-font" style={{ fontSize: '0.95rem' }}>{item.name}</h4>
                <p style={{ color: 'var(--accent-gold)', fontSize: '0.85rem' }}>{vnd(item.price)} · SL: {item.quantity}</p>
                {item.engraving && <p style={{ fontSize: '0.7rem', color: '#666', fontStyle: 'italic' }}>🖊️ Khắc: "{item.engraving}"</p>}
              </div>
              <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', alignSelf: 'center', fontSize: '0.8rem' }}>Xóa</button>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div style={{ borderTop: '1px solid #222', paddingTop: '1.5rem' }}>
            {/* Gift Options in Sidebar */}
            <div className="cart-gift-options" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <label className="checkbox-label" style={{ fontSize: '0.85rem' }}>
                <input type="checkbox" checked={isGiftWrap} onChange={e => setIsGiftWrap(e.target.checked)} />
                <span>🎁 Gói quà cao cấp (+50k)</span>
              </label>
              {isGiftWrap && (
                <div className="fade-in" style={{ marginTop: '0.75rem' }}>
                  <textarea placeholder="Nhập lời chúc của bạn..." style={{ width: '100%', background: '#000', border: '1px solid #333', color: '#fff', padding: '0.5rem', fontSize: '0.8rem', borderRadius: '4px' }}
                    value={giftMessage} onChange={e => setGiftMessage(e.target.value)} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span className="brand-font">Tổng Đơn</span>
              <span style={{ color: 'var(--accent-gold)', fontSize: '1.1rem', fontWeight: 600 }}>{vnd(cartTotal + (isGiftWrap ? 2000 : 0))}</span>
            </div>
            <button className="btn-gold" style={{ width: '100%' }} onClick={() => { setIsCartOpen(false); setPage('cart') }}>Xem Giỏ Hàng</button>
          </div>
        )}
      </div>

      {/* === FOOTER (Store Only) === */}
      {page !== 'admin' && (
        <footer style={{ padding: '6rem 0', textAlign: 'center', background: '#080808', borderTop: '1px solid #111' }}>
          <div className="container">
            <h2 className="brand-font" style={{ color: 'var(--accent-gold)', letterSpacing: '4px', marginBottom: '1.5rem' }}>KP LUXURY</h2>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>&copy; 2026 KP Luxury Perfume. Tinh hoa nghệ thuật mùi hương.</p>
          </div>
        </footer>
      )}

      {/* ============================================================ */}
      {/*                    PAGE: ADMIN DASHBOARD                      */}
      {/* ============================================================ */}
      {page === 'admin' && isAdmin && (
        <AdminDashboard 
          products={products} 
          orders={orders} 
          cartTotal={cartTotal}
          setPage={setPage} 
        />
      )}
      {page === 'admin' && !isAdmin && (
        <AdminLogin 
          onLogin={(userData) => {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }}
          setPage={setPage}
          showToast={showToast}
        />
      )}
      {page !== 'admin' && (
        <>
          <button className="chatbot-toggle" onClick={() => setChatOpen(!chatOpen)}>
            {chatOpen ? '✕' : '💬'}
          </button>
          {chatOpen && (
            <div className="chatbot-widget">
              <div className="chatbot-header">
                <span>🤖 Trợ Lý Hương Thơm</span>
                <button onClick={() => setChatOpen(false)}>✕</button>
              </div>
              <div className="chatbot-messages">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`chat-msg ${msg.from}`}>{msg.text}</div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form className="chatbot-input" onSubmit={e => { e.preventDefault(); handleSendChat() }}>
                <input type="text" placeholder="Nhập tin nhắn..." value={chatInput}
                  onChange={e => setChatInput(e.target.value)} />
              </form>
            </div>
          )}
        </>
      )}
      {/* Modals for O2O (Store Only) */}
      {page !== 'admin' && (
        <>
          {showStockModal && (
            <div className="modal-overlay" onClick={() => setShowStockModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <h3 className="brand-font" style={{ marginBottom: '1.5rem' }}>Tồn Kho Tại Cửa Hàng</h3>
                <div className="store-list" style={{ display: 'grid', gap: '1rem' }}>
                  {[
                    { name: 'KP Luxury Quận 1', addr: '123 Lê Lợi, TP.HCM', stock: 'Có hàng' },
                    { name: 'KP Luxury Hoàn Kiếm', addr: '45 Hàng Bài, Hà Nội', stock: 'Có hàng' },
                    { name: 'KP Luxury Đà Nẵng', addr: '89 Bạch Đằng, Đà Nẵng', stock: 'Hết hàng' }
                  ].map(s => (
                    <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#111', borderRadius: '4px' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{s.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{s.addr}</div>
                      </div>
                      <div style={{ color: s.stock === 'Có hàng' ? '#27ae60' : '#e74c3c', fontSize: '0.85rem' }}>{s.stock}</div>
                    </div>
                  ))}
                </div>
                <button className="btn-gold" style={{ width: '100%', marginTop: '2rem' }} onClick={() => setShowStockModal(false)}>Đóng</button>
              </div>
            </div>
          )}

          {showBookingModal && (
            <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <h3 className="brand-font" style={{ marginBottom: '1rem' }}>Đặt Lịch Hẹn Showroom</h3>
                <p style={{ color: '#888', marginBottom: '2rem', fontSize: '0.9rem' }}>Trải nghiệm bộ sưu tập mùi hương cá nhân hóa cùng chuyên gia.</p>
                <div className="form-group">
                  <input type="text" placeholder="Họ và tên" style={{ background: '#000', border: '1px solid #333', color: '#fff', width: '100%', padding: '0.8rem', marginBottom: '1rem' }} />
                  <input type="datetime-local" style={{ background: '#000', border: '1px solid #333', color: '#fff', width: '100%', padding: '0.8rem', marginBottom: '1rem' }} />
                  <select style={{ background: '#000', border: '1px solid #333', color: '#fff', width: '100%', padding: '0.8rem' }}>
                    <option>Chọn chi nhánh gần bạn</option>
                    <option>KP Luxury Quận 1, TP.HCM</option>
                    <option>KP Luxury Hoàn Kiếm, Hà Nội</option>
                  </select>
                </div>
                <button className="btn-gold" style={{ width: '100%', marginTop: '2rem' }} onClick={() => { setShowBookingModal(false); showToast('Đặt lịch thành công!', 'success') }}>Xác Nhận Đặt Lịch</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default App
