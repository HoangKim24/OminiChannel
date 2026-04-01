import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

const ProductsSection = () => {
  const navigate = useNavigate();
  
  // Lấy dữ liệu từ store
  const products = useAppStore(state => state.products);
  const loading = useAppStore(state => state.loading);
  const favorites = useAppStore(state => state.favorites);
  const toggleFavorite = useAppStore(state => state.toggleFavorite);
  const addToCart = useAppStore(state => state.addToCart);

  // Filters State
  const searchTerm = useAppStore(state => state.searchTerm);
  const sortBy = useAppStore(state => state.sortBy);
  const setSortBy = useAppStore(state => state.setSortBy);
  const filterGender = useAppStore(state => state.filterGender);
  const setFilterGender = useAppStore(state => state.setFilterGender);
  const filterFamily = useAppStore(state => state.filterFamily);
  const setFilterFamily = useAppStore(state => state.setFilterFamily);
  const filterConcentration = useAppStore(state => state.filterConcentration);
  const setFilterConcentration = useAppStore(state => state.setFilterConcentration);
  const priceRange = useAppStore(state => state.priceRange);
  const setPriceRange = useAppStore(state => state.setPriceRange);

  const handleResetFilters = () => {
    setSortBy('default');
    setFilterGender('All');
    setFilterFamily('All');
    setFilterConcentration('All');
    setPriceRange(50000000);
  };

  const hasActiveFilter =
    sortBy !== 'default' ||
    filterGender !== 'All' ||
    filterFamily !== 'All' ||
    filterConcentration !== 'All' ||
    priceRange !== 50000000;

  // Lọc sản phẩm cục bộ - memoize để tránh re-render không cần thiết
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(p => filterGender === 'All' || p.gender === filterGender)
      .filter(p => filterFamily === 'All' || (p.description + p.name).toLowerCase().includes(filterFamily.toLowerCase()))
      .filter(p => filterConcentration === 'All' || (p.concentration && p.concentration.toLowerCase().includes(filterConcentration.toLowerCase())))
      .filter(p => p.price * 24000 <= priceRange)
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [products, searchTerm, filterGender, filterFamily, filterConcentration, priceRange, sortBy]);

  const vnd = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price * 24000);

  return (
    <section id="products" className="products-section" style={{ scroll: 'smooth' }}>
      <div className="container">
        <h2 className="section-title">
          <span>Tuyển Chọn Đặc Biệt</span>
          Bộ Sưu Tập Kiệt Tác
        </h2>

        <div className="filter-summary">
          <p>
            Hiển thị <strong>{filteredProducts.length}</strong> sản phẩm phù hợp
          </p>
          <button
            type="button"
            className="reset-filter-btn"
            onClick={handleResetFilters}
            disabled={!hasActiveFilter}
          >
            Đặt lại bộ lọc
          </button>
        </div>

        {/* Search & Filter */}
        <div className="search-filter-bar">
          <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="default">Sắp xếp mặc định</option>
            <option value="price-asc">Giá: Thấp → Cao</option>
            <option value="price-desc">Giá: Cao → Thấp</option>
            <option value="name">Tên: A → Z</option>
          </select>
          <select className="filter-select" value={filterGender} onChange={e => setFilterGender(e.target.value)}>
            <option value="All">Tất cả giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Unisex">Unisex</option>
          </select>
          <select className="filter-select" value={filterFamily} onChange={e => setFilterFamily(e.target.value)}>
            <option value="All">Tất cả nhóm hương</option>
            <option value="tươi mát">Tươi mát</option>
            <option value="hoa">Hương hoa</option>
            <option value="gỗ">Hương gỗ</option>
            <option value="ngọt">Hương ngọt</option>
          </select>
          <select className="filter-select" value={filterConcentration} onChange={e => setFilterConcentration(e.target.value)}>
            <option value="All">Tất cả nồng độ</option>
            <option value="parfum">Parfum</option>
            <option value="eau de parfum">Eau de Parfum</option>
            <option value="eau de toilette">Eau de Toilette</option>
          </select>
          <select className="filter-select" value={priceRange} onChange={e => setPriceRange(Number(e.target.value))}>
            <option value={50000000}>Tất cả mức giá</option>
            <option value={10000000}>Dưới 10 triệu</option>
            <option value={5000000}>Dưới 5 triệu</option>
            <option value={2000000}>Dưới 2 triệu</option>
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
                <div className="product-image-container" onClick={() => navigate(`/product/${product.id}`)}>
                  <img src={product.imageUrl} alt={product.name} className="product-image" loading="lazy" />
                  <img src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400" alt="lifestyle" className="product-image-hover" loading="lazy" />
                  <div className="product-badge-row">
                    {product.gender && <span className="product-badge">{product.gender}</span>}
                    {product.concentration && <span className="product-badge muted">{product.concentration}</span>}
                  </div>
                  <div className="card-actions">
                    <button className={`icon-btn ${favorites.includes(product.id) ? 'active' : ''}`}
                      aria-label="Them vao yeu thich"
                      onClick={e => { e.stopPropagation(); toggleFavorite(product.id) }}>♥</button>
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
  );
};

export default ProductsSection;

