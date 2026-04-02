import { useState, useMemo } from 'react';
import { useToast } from '../../../utils/toastContext.jsx';

const ProductsTab = ({ products, user, onRefresh }) => {
  const { success, error } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', brand: 'KP', gender: 'Unisex', price: '', stockQuantity: '', topNotes: '', middleNotes: '', baseNotes: '', concentration: 'EDP', volumeOptions: '30ml:0.7,50ml:1.0,100ml:1.6', description: '', imageUrl: '', origin: '', brandStory: '' });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '', brand: product.brand || '', gender: product.gender || 'Unisex',
      price: product.price || '', stockQuantity: product.stockQuantity || 0,
      topNotes: product.topNotes || '', middleNotes: product.middleNotes || '', baseNotes: product.baseNotes || '',
      concentration: product.concentration || 'EDP', volumeOptions: product.volumeOptions || '',
      description: product.description || '', imageUrl: product.imageUrl || '', origin: product.origin || '', brandStory: product.brandStory || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...(editingProduct ? { id: editingProduct.id } : {}),
        name: formData.name, brand: formData.brand, gender: formData.gender,
        price: parseFloat(formData.price) || 0, stockQuantity: parseInt(formData.stockQuantity) || 0,
        topNotes: formData.topNotes, middleNotes: formData.middleNotes, baseNotes: formData.baseNotes,
        concentration: formData.concentration, volumeOptions: formData.volumeOptions,
        origin: formData.origin, brandStory: formData.brandStory,
        description: formData.description, imageUrl: formData.imageUrl,
        categoryId: editingProduct?.categoryId || null
      };

      const url = editingProduct ? `/api/perfumes/${editingProduct.id}` : '/api/perfumes';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', 'X-User-Role': user?.role || 'Admin' },
        body: JSON.stringify(body)
      });

      if (res.ok || res.status === 201 || res.status === 204) {
        const message = editingProduct ? '✓ Cập nhật sản phẩm thành công!' : '✓ Thêm sản phẩm mới thành công!';
        success(message);
        setShowModal(false);
        if (onRefresh) onRefresh();
      } else {
        const err = await res.json().catch(() => ({}));
        error(err.message || 'Lỗi khi lưu sản phẩm');
      }
    } catch (err) { error('Lỗi kết nối: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      const res = await fetch(`/api/perfumes/${id}`, {
        method: 'DELETE', headers: { 'X-User-Role': user?.role || 'Admin' }
      });
      if (res.ok || res.status === 204) {
        success('✓ Xóa sản phẩm thành công!');
        if (onRefresh) onRefresh();
        setShowModal(false);
      } else {
        error('Lỗi khi xóa sản phẩm');
      }
    } catch (err) { error('Lỗi: ' + err.message); }
  };

  const filteredProducts = useMemo(() => {
    return (products || []).filter(p => {
      const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (p.brand || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGender = filterGender === 'all' || p.gender === filterGender;
      const matchesPrice = p.price >= priceRange.min && p.price <= priceRange.max;
      return matchesSearch && matchesGender && matchesPrice;
    });
  }, [products, searchQuery, filterGender, priceRange]);

  return (
    <div className="fade-in admin-tab products-tab">
      <div className="glass-panel shadow-gold admin-tab-shell">
        <div className="admin-tab-header">
          <div>
            <h2 className="brand-font admin-tab-title">Danh Mục Sản Phẩm</h2>
            <p className="admin-tab-subtitle">
              Quản lý bộ sưu tập nước hoa thượng lưu của bạn.
            </p>
          </div>
          <div className="admin-tab-actions">
             <input 
               type="text" 
               placeholder="🔍 Tìm kiếm sản phẩm..." 
               className="luxury-input-field"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               style={{ flex: 1, minWidth: '200px' }}
             />
             <select 
               className="luxury-input-field"
               value={filterGender}
               onChange={(e) => setFilterGender(e.target.value)}
             >
               <option value="all">Tất cả loại</option>
               <option value="Nam">Nam</option>
               <option value="Nữ">Nữ</option>
               <option value="Unisex">Unisex</option>
             </select>
             <button className="luxury-button-gold" onClick={openAddModal}>+ THÊM TUYỆT TÁC</button>
          </div>
        </div>

        <div className="table-container shadow-gold admin-table-shell">
          <table className="admin-table-modern">
            <thead className="admin-table-head">
              <tr>
                <th className="admin-th">Kiệt Tác</th>
                <th className="admin-th">Chi Tiết</th>
                <th className="admin-th">Phân Loại</th>
                <th className="admin-th">Giá & Tồn Kho</th>
                <th className="admin-th admin-th-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id} className="table-row-hover admin-tr">
                  <td className="admin-td">
                    <div className="admin-product-main">
                      <img src={p.imageUrl} alt="" className="admin-product-img" />
                      <div>
                        <div className="brand-font admin-product-name">{p.name}</div>
                        <div className="admin-cell-sub">SKU: {p.id.toString().padStart(6, '0')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="admin-td">
                    <div className="admin-cell-text">{p.brand || 'Luxury Concept'}</div>
                    <div className="admin-cell-sub">{p.concentration || 'Eau de Parfum'}</div>
                  </td>
                  <td className="admin-td">
                    <span className={`luxury-badge ${p.gender === 'Nam' ? 'gender-badge-male' : p.gender === 'Nữ' ? 'gender-badge-female' : 'gender-badge-unspecified'}`}>
                      {p.gender || 'Unisex'}
                    </span>
                  </td>
                  <td className="admin-td">
                    <div className="admin-order-code">{p.price?.toLocaleString()} đ</div>
                    <div className={p.stockQuantity < 5 ? 'status-critical' : ''} style={{ fontSize: '0.7rem', color: p.stockQuantity < 5 ? 'var(--status-critical)' : 'var(--text-muted)', marginTop: '4px' }}>
                      CÒN: {p.stockQuantity || 0} CHAI
                    </div>
                  </td>
                  <td className="admin-td admin-td-center">
                    <button className="luxury-input-field admin-mini-btn" onClick={() => openEditModal(p)}>
                      CHI TIẾT
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="admin-modal-overlay admin-modal-overlay-right">
          <div className="glass-panel fade-in-right admin-side-modal">
            <div className="admin-modal-head">
              <h2 className="brand-font admin-modal-title">
                {editingProduct ? 'Hồ Sơ Kiệt Tác' : 'Kiến Tạo Tuyệt Tác'}
              </h2>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form className="admin-modal-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="admin-field-label">TÊN SẢN PHẨM</label>
                <input className="luxury-input-field admin-field-full" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Bleu de Chanel Parfum..." />
              </div>

              <div className="admin-form-grid-2">
                <div className="input-group">
                  <label className="admin-field-label">THƯƠNG HIỆU</label>
                  <input className="luxury-input-field admin-field-full" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                </div>
                <div className="input-group">
                   <label className="admin-field-label">PHÂN LOẠI</label>
                   <select className="luxury-input-field admin-field-full" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                      <option>Unisex</option>
                      <option>Nam</option>
                      <option>Nữ</option>
                   </select>
                </div>
              </div>

              <div className="admin-form-grid-2">
                <div className="input-group">
                   <label className="admin-field-label">GIÁ NIÊM YẾT</label>
                   <input type="number" className="luxury-input-field admin-field-full" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div className="input-group">
                   <label className="admin-field-label">SỐ LƯỢNG KHO</label>
                   <input type="number" className="luxury-input-field admin-field-full" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} />
                </div>
              </div>

              <div className="input-group">
                <label className="admin-field-label">LINK HÌNH ẢNH</label>
                <input className="luxury-input-field admin-field-full" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://..." />
              </div>

              <div className="admin-modal-subpanel">
                <h4 className="brand-font admin-modal-subtitle">Scent Profile (Tầng Hương)</h4>
                <div className="admin-modal-stack">
                   <input className="luxury-input-field" placeholder="Top Notes: Citrus, Mint, Pink Pepper" value={formData.topNotes} onChange={e => setFormData({...formData, topNotes: e.target.value})} />
                   <input className="luxury-input-field" placeholder="Middle Notes: Rose, Jasmine, Lavender" value={formData.middleNotes} onChange={e => setFormData({...formData, middleNotes: e.target.value})} />
                   <input className="luxury-input-field" placeholder="Base Notes: Sandalwood, Cedar, White Musk" value={formData.baseNotes} onChange={e => setFormData({...formData, baseNotes: e.target.value})} />
                </div>
              </div>

              <div className="admin-form-grid-2">
                <div className="input-group">
                  <label className="admin-field-label">NỒNG ĐỘ</label>
                  <input className="luxury-input-field admin-field-full" value={formData.concentration} onChange={e => setFormData({...formData, concentration: e.target.value})} placeholder="EDP / EDT / Parfum" />
                </div>
                <div className="input-group">
                  <label className="admin-field-label">TÙY CHỌN DUNG TÍCH</label>
                  <input className="luxury-input-field admin-field-full" value={formData.volumeOptions} onChange={e => setFormData({...formData, volumeOptions: e.target.value})} placeholder="30ml:0.7,50ml:1.0,100ml:1.6" />
                </div>
              </div>

              <div className="admin-form-grid-2">
                <div className="input-group">
                  <label className="admin-field-label">XUẤT XỨ</label>
                  <input className="luxury-input-field admin-field-full" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} placeholder="France / Italy / Spain" />
                </div>
                <div className="input-group">
                  <label className="admin-field-label">CÂU CHUYỆN THƯƠNG HIỆU</label>
                  <input className="luxury-input-field admin-field-full" value={formData.brandStory} onChange={e => setFormData({...formData, brandStory: e.target.value})} placeholder="Ngắn gọn mô tả cảm hứng sản phẩm" />
                </div>
              </div>

              <div className="input-group">
                <label className="admin-field-label">CÂU CHUYỆN SẢN PHẨM</label>
                <textarea className="luxury-input-field admin-modal-textarea" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div className="admin-modal-actions">
                <button type="submit" className="luxury-button-gold" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'ĐANG LƯU...' : (editingProduct ? 'CẬP NHẬT KIỆT TÁC' : 'TẠO MỚI')}
                </button>
                {editingProduct && <button type="button" className="luxury-input-field status-critical" onClick={() => handleDelete(editingProduct.id)}>XÓA</button>}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsTab;

