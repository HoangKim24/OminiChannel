import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import RecommendationSection from '../components/RecommendationSection'
import '../styles/recommendation.css'
import '../styles/detail.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const parseVolumeOptions = (volumeOptions) => {
  if (!volumeOptions || typeof volumeOptions !== 'string') return []
  return volumeOptions
    .split(',')
    .map(option => option.trim())
    .filter(Boolean)
    .map(option => {
      const [label, multiplierValue] = option.split(':').map(part => part.trim())
      return {
        label: label || '50ml',
        multiplier: Number(multiplierValue) || 1,
      }
    })
    .filter(option => option.label)
}

const normalizeProduct = (product) => ({
  id: product.id ?? product.Id,
  name: product.name ?? product.Name ?? '',
  brand: product.brand ?? product.Brand ?? 'KP',
  price: Number(product.price ?? product.Price ?? 0),
  description: product.description ?? product.Description ?? '',
  imageUrl: product.imageUrl ?? product.ImageUrl ?? '',
  categoryId: product.categoryId ?? product.CategoryId ?? null,
  gender: product.gender ?? product.Gender ?? 'Unisex',
  stockQuantity: Number(product.stockQuantity ?? product.StockQuantity ?? 0),
  topNotes: product.topNotes ?? product.TopNotes ?? '',
  middleNotes: product.middleNotes ?? product.MiddleNotes ?? '',
  baseNotes: product.baseNotes ?? product.BaseNotes ?? '',
  concentration: product.concentration ?? product.Concentration ?? '',
  volumeOptions: product.volumeOptions ?? product.VolumeOptions ?? '',
})

const DETAIL_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1595425977377-9a6f0f0fef87?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1200&q=80',
]

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const products = useAppStore(state => state.products)
  const user = useAppStore(state => state.user)
  const addToCart = useAppStore(state => state.addToCart)
  const showToast = useAppStore(state => state.showToast)
  const favorites = useAppStore(state => state.favorites)
  const toggleFavorite = useAppStore(state => state.toggleFavorite)
  
  const [product, setProduct] = useState(null)
  const [detailQty, setDetailQty] = useState(1)
  const [selectedSize, setSelectedSize] = useState('50ml')
  const [engravingText, setEngravingText] = useState('')
  const [isEngravingActive, setIsEngravingActive] = useState(false)
  const [activeTab, setActiveTab] = useState('desc')
  const [productLoading, setProductLoading] = useState(true)
  
  // Gallery & Zoom
  const [mainImageIndex, setMainImageIndex] = useState(0)
  const [isZoomOpen, setIsZoomOpen] = useState(false)
  
  // Comments
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [newComment, setNewComment] = useState({ name: user?.username || '', text: '', stars: 5 })
  const [hoverStar, setHoverStar] = useState(0)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [filterStars, setFilterStars] = useState(0)

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0)

    let cancelled = false
    
    const pId = Number(id)
    const found = products.find(p => Number(p.id ?? p.Id) === pId)
    if (found) {
      setProduct(normalizeProduct(found))
      setProductLoading(false)
    } else {
      setProductLoading(true)
      fetch(`${API_BASE}/api/perfumes/${pId}`)
        .then(async (res) => {
          if (!res.ok) return null
          return res.json()
        })
        .then((data) => {
          if (!cancelled && data) {
            setProduct(normalizeProduct(data))
          }
        })
        .catch((err) => {
          console.error('Fetch product detail error', err)
        })
        .finally(() => {
          if (!cancelled) setProductLoading(false)
        })
    }
    
    // Fetch comments
    const fetchComments = async () => {
      setCommentsLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/comments/perfume/${pId}`)
        if (res.ok) {
          const data = await res.json()
          setComments(data.map(c => ({
            id: c.id, name: c.userName, stars: c.stars, text: c.text,
            date: new Date(c.createdAt || c.CreatedAt).toLocaleDateString('vi-VN'), verified: c.isVerified
          })))
        } else {
          console.warn('Failed to fetch comments')
        }
      } catch (err) { 
        console.error('Fetch comments error', err)
      } finally {
        setCommentsLoading(false)
      }
    }
    fetchComments()

    return () => {
      cancelled = true
    }
  }, [id, products])

  const sizes = useMemo(() => {
    const parsedSizes = parseVolumeOptions(product?.volumeOptions)
    return parsedSizes.length > 0
      ? parsedSizes
      : [
          { label: '30ml', multiplier: 0.7 },
          { label: '50ml', multiplier: 1 },
          { label: '100ml', multiplier: 1.6 },
        ]
  }, [product?.volumeOptions])
  const activeSize = sizes.find(sz => sz.label === selectedSize) || sizes[1] || sizes[0]
  const currentPrice = (product?.price || 0) * (activeSize.multiplier || 1)
  const stockQty = product?.stockQuantity ?? 0
  const stockStatus = stockQty === 0 ? 'out' : stockQty <= 10 ? 'low' : 'in'
  const maxQtyAllowed = Math.max(1, stockQty)
  
  const galleryImages = useMemo(() => {
    const primaryImage = product?.imageUrl?.trim()
    const fallbackByProduct = product?.id
      ? [
          DETAIL_FALLBACK_IMAGES[product.id % DETAIL_FALLBACK_IMAGES.length],
          DETAIL_FALLBACK_IMAGES[(product.id + 1) % DETAIL_FALLBACK_IMAGES.length],
          DETAIL_FALLBACK_IMAGES[(product.id + 2) % DETAIL_FALLBACK_IMAGES.length],
        ]
      : DETAIL_FALLBACK_IMAGES

    const mergedImages = primaryImage
      ? [primaryImage, ...fallbackByProduct.filter(img => img !== primaryImage)]
      : fallbackByProduct

    return Array.from(new Set(mergedImages)).slice(0, 3)
  }, [product?.id, product?.imageUrl])

  const handleSelectSize = (sizeLabel, sizeIndex) => {
    setSelectedSize(sizeLabel)
    if (!galleryImages.length) return
    setMainImageIndex(sizeIndex % galleryImages.length)
  }

  useEffect(() => {
    if (!sizes.length) return
    if (!sizes.some(size => size.label === selectedSize)) {
      const defaultSize = sizes.find(size => size.label === '50ml') || sizes[0]
      if (defaultSize) setSelectedSize(defaultSize.label)
    }
  }, [sizes, selectedSize])

  useEffect(() => {
    if (!galleryImages.length) return
    if (mainImageIndex >= galleryImages.length) {
      setMainImageIndex(0)
    }
  }, [galleryImages, mainImageIndex])

  if (productLoading) return <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>Đang tải sản phẩm...</div>
  if (!product) return <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>Không tìm thấy sản phẩm.</div>

  const submitComment = async () => {
    if (!newComment.name.trim() || !newComment.text.trim()) { showToast('Vui lòng nhập tên và nội dung đánh giá', 'error'); return }
    if (newComment.text.trim().length < 10) { showToast('Đánh giá phải có ít nhất 10 ký tự', 'error'); return }
    
    const commentData = {
      perfumeId: product.id,
      userName: newComment.name,
      text: newComment.text,
      stars: newComment.stars,
      isVerified: !!user
    }
    
    setIsSubmittingComment(true)
    try {
      const res = await fetch(`${API_BASE}/api/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData)
      })
      if (res.ok) {
        const saved = await res.json()
        const comment = { id: saved.id, name: saved.userName, text: saved.text, stars: saved.stars, date: new Date(saved.createdAt || saved.CreatedAt).toLocaleDateString('vi-VN'), verified: saved.isVerified }
        setComments(prev => [comment, ...prev])
        setNewComment({ name: user?.username || '', text: '', stars: 5 })
        showToast('Cảm ơn bạn đã đánh giá! ⭐')
      } else {
        showToast('Lỗi gửi đánh giá', 'error')
      }
    } catch (err) { 
      console.error('Comment submit error:', err)
      showToast('Lỗi kết nối khi gửi đánh giá', 'error') 
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const setDetailQtyClamped = (nextQty) => {
    const parsedQty = Number.parseInt(nextQty, 10)
    if (Number.isNaN(parsedQty)) {
      setDetailQty(1)
      return
    }
    setDetailQty(Math.min(maxQtyAllowed, Math.max(1, parsedQty)))
  }

  const handleAddToCartWithEngraving = (redirectToCheckout = false) => {
    if (stockStatus === 'out') {
      showToast('Sản phẩm hết hàng', 'error')
      return
    }

    if (detailQty > stockQty) {
      showToast(`Số lượng vượt tồn kho. Hiện còn ${stockQty} sản phẩm.`, 'error')
      return
    }

    addToCart(product, detailQty, isEngravingActive ? engravingText : null)
    showToast(`✨  Đã thêm "${product.name}" (${selectedSize}) vào giỏ hàng${isEngravingActive ? ' - Khắc: ' + engravingText : ''}!`)

    if (redirectToCheckout) {
      setTimeout(() => navigate('/checkout'), 300)
    }
  }

  const handleShare = (platform) => {
    const url = encodeURIComponent(window.location.href)
    const title = encodeURIComponent(`Xem sản phẩm: ${product.name}`)
    let shareUrl = ''
    
    if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
    } else if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`
    } else if (platform === 'whatsapp') {
      shareUrl = `https://wa.me/?text=${title} ${url}`
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(window.location.href)
      showToast('✓ Sao chép liên kết thành công!')
      return
    }
    
    if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400')
  }

  const vnd = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)
  
  const avgRating = comments.length ? (comments.reduce((s, c) => s + c.stars, 0) / comments.length) : 5.0
  const filteredComments = filterStars === 0 ? comments : comments.filter(c => c.stars === filterStars)
  const ratingDistribution = [5, 4, 3, 2, 1].map(s => ({
    stars: s,
    count: comments.filter(c => c.stars === s).length
  }))
  
  const related = products
    .map(normalizeProduct)
    .filter(p => p.id !== product.id && (p.categoryId === product.categoryId || p.gender === product.gender))
    .slice(0, 4)

  const isFavorited = favorites.includes(product.id)

  return (
    <div className="detail-page" style={{ paddingTop: '80px' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
          <Link to="/" style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>Trang Chủ</Link>
          <span style={{ color: '#555' }}>›</span>
          <span style={{ color: '#aaa' }}>{product.name}</span>
        </div>

        <div className="detail-layout">
          {/* Gallery */}
          <div className="detail-gallery">
            <div className="bottle-preview-container" onClick={() => setIsZoomOpen(true)} style={{ cursor: 'zoom-in' }}>
              <img src={galleryImages[mainImageIndex] || product.imageUrl} alt={product.name} className="detail-main-img" />
              {isEngravingActive && engravingText && <div className="engraving-overlay">{engravingText}</div>}
              <div className="zoom-hint">🔍 Click để phóng to</div>
            </div>
            <div className="detail-thumbnails">
              {galleryImages.map((img, idx) => (
                <img key={idx} src={img} alt="" className={`detail-thumb ${mainImageIndex === idx ? 'active' : ''}`} onClick={() => setMainImageIndex(idx)} />
              ))}
            </div>
          </div>

          {/* Zoom Modal */}
          {isZoomOpen && (
            <div className="zoom-modal" onClick={() => setIsZoomOpen(false)}>
              <div className="zoom-container" onClick={e => e.stopPropagation()}>
                <button className="zoom-close" onClick={() => setIsZoomOpen(false)}>✕</button>
                <img src={galleryImages[mainImageIndex] || product.imageUrl} alt={product.name} className="zoom-image" />
              </div>
            </div>
          )}

          {/* Info */}
          <div className="detail-info">
            {/* Product Badges */}
            <div className="product-badges">
              {stockStatus === 'low' && <span className="badge-hot">⚡ Sắp hết hàng</span>}
              {Math.random() > 0.5 && <span className="badge-new">✨ Mới</span>}
              {<span className="badge-sale">-20% Giảm giá</span>}
            </div>

            <div className="detail-brand">{product.brand || 'KP LUXURY'}</div>
            <h1>{product.name}</h1>
            
            {/* Rating & Wishlist */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div className="detail-rating">
                {'★'.repeat(Math.floor(avgRating))}{'☆'.repeat(5 - Math.floor(avgRating))}
                <span>{avgRating.toFixed(1)}/5 từ {comments.length} đánh giá</span>
              </div>
              <button className={`btn-wishlist ${isFavorited ? 'active' : ''}`} onClick={() => toggleFavorite(product.id)}>
                {isFavorited ? '❤️' : '🤍'}
              </button>
            </div>

            {/* Stock Countdown */}
            {stockStatus === 'low' && (
              <div className="stock-countdown">
                ⏰ Chỉ còn <strong>{stockQty}</strong> chai! Mua ngay trước khi hết.
              </div>
            )}

            <div className={`stock-badge ${stockStatus === 'in' ? 'in-stock' : stockStatus === 'low' ? 'low-stock' : 'out-stock'}`}>
              {stockStatus === 'in' && '● Còn hàng'}
              {stockStatus === 'low' && `⚠ Sắp hết hàng · Còn ${stockQty} sản phẩm`}
              {stockStatus === 'out' && '✕ Hết hàng'}
            </div>

            <div className="detail-price-wrap">
              <span className="detail-current-price">{vnd(currentPrice)}</span>
              <span className="detail-old-price">{vnd(currentPrice * 1.25)}</span>
              <span className="detail-discount">-20%</span>
            </div>

            {/* Price Comparison Table */}
            <div className="price-comparison-table">
              <table>
                <thead>
                  <tr>
                    <th>Dung tích</th>
                    <th>Giá</th>
                    <th>Giá/ml</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((sz, idx) => {
                    const sizePrice = (product.price || 0) * (sz.multiplier || 1)
                    const mlValue = parseInt(sz.label)
                    const pricePerMl = sizePrice / mlValue
                    return (
                      <tr
                        key={sz.label}
                        className={selectedSize === sz.label ? 'active-row' : ''}
                        onClick={() => handleSelectSize(sz.label, idx)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleSelectSize(sz.label, idx)
                          }
                        }}
                        aria-label={`Chọn dung tích ${sz.label}`}
                      >
                        <td>{sz.label}</td>
                        <td>{vnd(sizePrice)}</td>
                        <td>{vnd(pricePerMl)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Size selector */}
            <div className="size-selector">
              <label>Dung tích</label>
              <div className="size-options">
                {sizes.map((sz, idx) => (
                  <button key={sz.label} type="button" className={`size-btn ${selectedSize === sz.label ? 'active' : ''}`} onClick={() => handleSelectSize(sz.label, idx)}>
                    {sz.label}
                    <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: '0.25rem' }}>
                      ({Math.round((sz.multiplier || 1) * 100)}% giá)
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Engraving */}
            <div className="engraving-service">
              <label className="checkbox-label">
                <input type="checkbox" checked={isEngravingActive} onChange={e => setIsEngravingActive(e.target.checked)} />
                <span>🖋️ Dịch vụ khắc tên (Miễn phí)</span>
              </label>
              {isEngravingActive && (
                <div className="engraving-input-wrap fade-in">
                  <input type="text" maxLength="15" placeholder="Nhập tên bạn muốn khắc..." value={engravingText} onChange={e => setEngravingText(e.target.value)} />
                </div>
              )}
            </div>

            {/* Quantity */}
            <div className="detail-qty" style={{ marginTop: '1.5rem' }}>
              <label>Số lượng</label>
              <div>
                <div className="detail-qty-wrap">
                  <button
                    type="button"
                    className="detail-qty-btn"
                    disabled={detailQty <= 1}
                    onClick={() => setDetailQtyClamped(detailQty - 1)}
                  >
                    −
                  </button>
                  <input
                    className="detail-qty-input"
                    type="number"
                    min="1"
                    max={maxQtyAllowed}
                    value={detailQty}
                    onChange={(e) => setDetailQtyClamped(e.target.value)}
                  />
                  <button
                    type="button"
                    className="detail-qty-btn"
                    disabled={detailQty >= maxQtyAllowed}
                    onClick={() => setDetailQtyClamped(detailQty + 1)}
                  >
                    +
                  </button>
                </div>
                <div className="detail-qty-tools">
                  <button type="button" className="detail-qty-chip" onClick={() => setDetailQtyClamped(detailQty + 1)}>+1</button>
                  <button type="button" className="detail-qty-chip" onClick={() => setDetailQtyClamped(detailQty + 5)}>+5</button>
                  <button type="button" className="detail-qty-chip" onClick={() => setDetailQtyClamped(maxQtyAllowed)}>Lấy tối đa</button>
                </div>
                <p className="detail-qty-helper">Giới hạn hiện tại: tối đa {maxQtyAllowed} sản phẩm.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="detail-actions">
              <button className="btn-add-cart-detail" onClick={() => handleAddToCartWithEngraving()} disabled={stockStatus === 'out'}>
                🛒 Thêm Vào Giỏ
              </button>
              <button className="btn-buy-now" onClick={() => handleAddToCartWithEngraving(true)} disabled={stockStatus === 'out'}>
                ⚡ Mua Ngay
              </button>
            </div>

            {/* Share Buttons */}
            <div className="share-buttons">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Chia sẻ:</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className="share-btn" onClick={() => handleShare('facebook')} title="Chia sẻ Facebook">f</button>
                <button className="share-btn" onClick={() => handleShare('twitter')} title="Chia sẻ Twitter">𝕏</button>
                <button className="share-btn" onClick={() => handleShare('whatsapp')} title="Chia sẻ WhatsApp">💬</button>
                <button className="share-btn" onClick={() => handleShare('copy')} title="Sao chép liên kết">🔗</button>
              </div>
            </div>
            
            {/* NavTabs */}
            <div className="info-tabs" style={{ marginTop: '2rem' }}>
              <div className="tab-headers">
                {[['desc', 'Mô Tả'], ['spec', 'Chi Tiết']].map(([key, label]) => (
                  <button key={key} className={`tab-header-btn ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>{label}</button>
                ))}
              </div>
              <div className="tab-content" style={{ marginTop: '1rem', lineHeight: '1.6', color: '#ccc' }}>
                {activeTab === 'desc' && <p>{product.description}</p>}
                {activeTab === 'spec' && (
                  <ul style={{ paddingLeft: '20px' }}>
                     <li>Giới tính: {product.gender}</li>
                     <li>Hương đầu: {product.topNotes || 'Đang cập nhật...'}</li>
                     <li>Hương giữa: {product.middleNotes || 'Đang cập nhật...'}</li>
                     <li>Hương cuối: {product.baseNotes || 'Đang cập nhật...'}</li>
                     <li>Nồng độ: {product.concentration || 'Đang cập nhật...'}</li>
                  </ul>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* RELATED PRODUCTS SECTION */}
        {related.length > 0 && (
          <div style={{ marginTop: '6rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '3rem' }}>
            <h2 className="brand-font" style={{ fontSize: '1.8rem', marginBottom: '2rem', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-gold-500)', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '0.5rem', fontWeight: 500 }}>Khám Phá Thêm</span>
              Sản Phẩm Tương Tự
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem' }}>
              {related.map(p => (
                <div key={p.id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', cursor: 'pointer', transition: 'var(--transition-normal)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }} onClick={() => navigate(`/product/${p.id}`)} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-gold-500)'; e.currentTarget.style.transform = 'translateY(-8px)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <img src={p.imageUrl} alt={p.name} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', background: 'var(--bg-secondary)', display: 'block', filter: 'brightness(0.9)', transition: 'var(--transition-normal)' }} onMouseEnter={e => e.target.style.filter = 'brightness(1)'} onMouseLeave={e => e.target.style.filter = 'brightness(0.9)'} />
                  <div style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--bg-elevated)', position: 'relative', zIndex: 2 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.5rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>{p.name}</h3>
                    <p style={{ color: 'var(--color-gold-500)', fontSize: '0.95rem', fontWeight: 500 }}>{vnd(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVIEWS SECTION */}
        <div className="review-section" style={{ marginTop: '4rem' }}>
          <h2 className="brand-font" style={{ fontSize: '1.8rem', marginBottom: '2rem', textAlign: 'center' }}>Đánh Giá Khách Hàng</h2>

          {/* Rating Distribution */}
          <div className="rating-distribution" style={{ maxWidth: '400px', margin: '0 auto 2rem', background: 'var(--bg-elevated)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: 500 }}>Phân bố đánh giá</p>
            {ratingDistribution.map(item => (
              <div key={item.stars} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', cursor: 'pointer' }} onClick={() => setFilterStars(filterStars === item.stars ? 0 : item.stars)}>
                <span style={{ fontSize: '0.9rem', minWidth: '30px' }}>{item.stars}⭐</span>
                <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${comments.length ? (item.count / comments.length) * 100 : 0}%`, background: 'var(--color-gold-500)', transition: 'width 0.3s' }}></div>
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minWidth: '40px', textAlign: 'right' }}>{item.count}</span>
              </div>
            ))}
          </div>

          {/* Review Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <button className={`review-filter-btn ${filterStars === 0 ? 'active' : ''}`} onClick={() => setFilterStars(0)}>
              Tất cả ({comments.length})
            </button>
            {[5, 4, 3, 2, 1].map(s => {
              const count = comments.filter(c => c.stars === s).length
              return (
                <button key={s} className={`review-filter-btn ${filterStars === s ? 'active' : ''}`} onClick={() => setFilterStars(s)}>
                  {s}⭐ ({count})
                </button>
              )
            })}
          </div>
          <div className="comment-form" style={{ maxWidth: '600px', margin: '0 auto 2rem', background: '#111', padding: '1.5rem', borderRadius: '12px' }}>
            <h3 style={{ marginBottom: '1rem' }}>✍️ Viết Đánh Giá</h3>
            <div style={{ marginBottom: '1rem' }}>
              <div className="star-picker" style={{ display: 'flex', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} style={{ background: 'transparent', border: 'none', color: s <= (hoverStar || newComment.stars) ? 'var(--accent-gold)' : '#333', fontSize: '1.5rem', cursor: 'pointer' }}
                    onMouseEnter={() => setHoverStar(s)} onMouseLeave={() => setHoverStar(0)}
                    onClick={() => setNewComment(c => ({ ...c, stars: s }))}>★</button>
                ))}
              </div>
            </div>
            <input type="text" style={{ width: '100%', background: '#222', border: '1px solid #333', padding: '0.8rem', color: '#fff', marginBottom: '1rem', borderRadius: '4px' }} placeholder="Tên của bạn..." value={newComment.name} onChange={e => setNewComment({ ...newComment, name: e.target.value })} />
            <textarea style={{ width: '100%', background: '#222', border: '1px solid #333', padding: '0.8rem', color: '#fff', marginBottom: '1rem', borderRadius: '4px', minHeight: '80px' }} placeholder="Đánh giá..." value={newComment.text} onChange={e => setNewComment({ ...newComment, text: e.target.value })} />
            <button className="btn-gold" style={{ width: '100%', opacity: isSubmittingComment ? 0.7 : 1 }} onClick={submitComment} disabled={isSubmittingComment}>
              {isSubmittingComment ? 'Đang gửi...' : 'Gửi Đánh Giá'}
            </button>
          </div>

          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {commentsLoading && <p style={{ color: '#888', textAlign: 'center' }}>Đang tải đánh giá...</p>}
            {filteredComments.length === 0 ? (
              <p style={{ color: '#888', textAlign: 'center' }}>Chưa có đánh giá nào</p>
            ) : (
              filteredComments.map(c => (
                <div key={c.id} className="comment-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ color: 'var(--color-gold-500)', marginBottom: '0.25rem' }}>{'★'.repeat(c.stars)}{'☆'.repeat(5 - c.stars)}</div>
                      <div style={{ fontSize: '0.9rem', color: '#888' }}>{c.name} · {c.date} {c.verified && <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#4ade80', padding: '0.2rem 0.4rem', borderRadius: '3px', fontSize: '0.75rem' }}>✓ Xác thực</span>}</div>
                    </div>
                  </div>
                  <p style={{ marginTop: '0.75rem', color: '#ccc' }}>{c.text}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recommendation Section */}
        <RecommendationSection perfumeId={product?.id} />

      </div>
    </div>
  )
}

export default ProductDetailPage

