import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

const FavoritesPage = () => {
  const navigate = useNavigate()
  const favorites = useAppStore(state => state.favorites)
  const products = useAppStore(state => state.products)
  const toggleFavorite = useAppStore(state => state.toggleFavorite)
  const addToCart = useAppStore(state => state.addToCart)

  const favoriteProducts = products.filter(p => favorites.includes(p.id))
  const vnd = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)

  return (
    <section className="products-section" style={{ paddingTop: '100px', minHeight: '80vh' }}>
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
            <button className="btn-gold" onClick={() => navigate('/')}>Khám phá ngay</button>
          </div>
        ) : (
          <div className="product-grid">
            {favoriteProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image-container" onClick={() => navigate(`/product/${product.id}`)}>
                  <img src={product.imageUrl} alt={product.name} className="product-image" loading="lazy" />
                  <div className="card-actions">
                    <button className="icon-btn active" onClick={e => { e.stopPropagation(); toggleFavorite(product.id) }}>♥</button>
                  </div>
                </div>
                <div className="product-info">
                  <h3 style={{ cursor: 'pointer' }} onClick={() => navigate(`/product/${product.id}`)}>{product.name}</h3>
                  <p className="product-price">{vnd(product.price)}</p>
                  <button className="add-to-cart-btn" onClick={() => addToCart(product)}>Thêm Vào Giỏ</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default FavoritesPage
