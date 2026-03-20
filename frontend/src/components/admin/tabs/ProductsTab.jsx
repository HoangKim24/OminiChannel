import React, { useState } from 'react';

const ProductsTab = ({ products, user, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', brand: 'KP', gender: 'Unisex', price: '', stockQuantity: '', topNotes: '', baseNotes: '', description: '', imageUrl: '' });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '', brand: product.brand || '', gender: product.gender || 'Unisex',
      price: product.price || '', stockQuantity: product.stockQuantity || 0,
      topNotes: product.topNotes || '', baseNotes: product.baseNotes || '',
      description: product.description || '', imageUrl: product.imageUrl || ''
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
        topNotes: formData.topNotes, baseNotes: formData.baseNotes,
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
        setShowModal(false);
        if (onRefresh) onRefresh();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Lỗi khi lưu sản phẩm');
      }
    } catch (err) { alert('Lỗi kết nối: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      const res = await fetch(`/api/perfumes/${id}`, {
        method: 'DELETE', headers: { 'X-User-Role': user?.role || 'Admin' }
      });
      if (res.ok || res.status === 204) {
        if (onRefresh) onRefresh();
        setShowModal(false);
      }
    } catch (err) { alert('Lỗi: ' + err.message); }
  };

  return (
    <div className="fade-in">
      <div className="glass-panel shadow-gold" style={{ border: 'none', background: 'transparent', padding: '0 0 2rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h2 className="brand-font" style={{ fontSize: '2rem', color: 'var(--admin-gold)' }}>Danh Mục Sản Phẩm</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', letterSpacing: '0.5px' }}>
              Quản lý bộ sưu tập nước hoa thượng lưu của bạn.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
             <button className="luxury-button-gold" onClick={openAddModal}>+ THÊM TUYỆT TÁC</button>
          </div>
        </div>

        <div className="table-container shadow-gold" style={{ background: 'rgba(10,10,10,0.5)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
          <table className="admin-table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'rgba(197, 160, 89, 0.05)', borderBottom: '1px solid var(--admin-border)' }}>
              <tr>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.65rem', color: 'var(--admin-gold)', textTransform: 'uppercase', letterSpacing: '2px' }}>Kiệt Tác</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.65rem', color: 'var(--admin-gold)', textTransform: 'uppercase', letterSpacing: '2px' }}>Chi Tiết</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.65rem', color: 'var(--admin-gold)', textTransform: 'uppercase', letterSpacing: '2px' }}>Phân Loại</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.65rem', color: 'var(--admin-gold)', textTransform: 'uppercase', letterSpacing: '2px' }}>Giá & Tồn Kho</th>
                <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.65rem', color: 'var(--admin-gold)', textTransform: 'uppercase', letterSpacing: '2px' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {(products || []).map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.3s' }} className="table-row-hover">
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <img src={p.imageUrl} alt="" style={{ width: '64px', height: '64px', objectFit: 'cover', border: '1px solid var(--admin-border)' }} />
                      <div>
                        <div className="brand-font" style={{ fontSize: '1.05rem', color: '#fff' }}>{p.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>SKU: {p.id.toString().padStart(6, '0')}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.brand || 'Luxury Concept'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{p.concentration || 'Eau de Parfum'}</div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <span className="luxury-badge" style={{ color: p.gender === 'Nam' ? '#3498db' : p.gender === 'Nữ' ? '#e91e63' : 'var(--admin-gold)' }}>
                      {p.gender || 'Unisex'}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ color: 'var(--admin-gold)', fontWeight: '700', fontSize: '0.95rem' }}>{p.price?.toLocaleString()} đ</div>
                    <div style={{ fontSize: '0.7rem', color: p.stockQuantity < 5 ? '#e74c3c' : 'var(--text-muted)', marginTop: '4px' }}>
                      CÒN: {p.stockQuantity || 0} CHAI
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                    <button className="luxury-input-field" style={{ fontSize: '0.65rem', padding: '0.5rem 1rem' }} onClick={() => openEditModal(p)}>
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', justifyContent: 'flex-end' }}>
          <div className="glass-panel fade-in-right" style={{ width: '600px', height: '100%', borderLeft: '1px solid var(--admin-border)', padding: '4rem', overflowY: 'auto', borderRadius: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
              <h2 className="brand-font" style={{ fontSize: '2.2rem', color: 'var(--admin-gold)' }}>
                {editingProduct ? 'Hồ Sơ Kiệt Tác' : 'Kiến Tạo Tuyệt Tác'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: '2.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <form style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} onSubmit={handleSubmit}>
              <div className="input-group">
                <label style={{ fontSize: '0.65rem', color: 'var(--admin-gold)', letterSpacing: '2px' }}>TÊN SẢN PHẨM</label>
                <input className="luxury-input-field" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Bleu de Chanel Parfum..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="input-group">
                  <label style={{ fontSize: '0.65rem', color: 'var(--admin-gold)', letterSpacing: '2px' }}>THƯƠNG HIỆU</label>
                  <input className="luxury-input-field" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                </div>
                <div className="input-group">
                   <label style={{ fontSize: '0.65rem', color: 'var(--admin-gold)', letterSpacing: '2px' }}>PHÂN LOẠI</label>
                   <select className="luxury-input-field" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                      <option>Unisex</option>
                      <option>Nam</option>
                      <option>Nữ</option>
                   </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="input-group">
                   <label style={{ fontSize: '0.65rem', color: 'var(--admin-gold)', letterSpacing: '2px' }}>GIÁ NIÊM YẾT</label>
                   <input type="number" className="luxury-input-field" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div className="input-group">
                   <label style={{ fontSize: '0.65rem', color: 'var(--admin-gold)', letterSpacing: '2px' }}>SỐ LƯỢNG KHO</label>
                   <input type="number" className="luxury-input-field" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} />
                </div>
              </div>

              <div className="input-group">
                <label style={{ fontSize: '0.65rem', color: 'var(--admin-gold)', letterSpacing: '2px' }}>LINK HÌNH ẢNH</label>
                <input className="luxury-input-field" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://..." />
              </div>

              <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--admin-border)' }}>
                <h4 className="brand-font" style={{ color: 'var(--admin-gold)', fontSize: '1rem', marginBottom: '1.5rem' }}>Scent Profile (Tầng Hương)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   <input className="luxury-input-field" placeholder="Top Notes: Citrus, Mint, Pink Pepper" value={formData.topNotes} onChange={e => setFormData({...formData, topNotes: e.target.value})} />
                   <input className="luxury-input-field" placeholder="Base Notes: Sandalwood, Cedar, White Musk" value={formData.baseNotes} onChange={e => setFormData({...formData, baseNotes: e.target.value})} />
                </div>
              </div>

              <div className="input-group">
                <label style={{ fontSize: '0.65rem', color: 'var(--admin-gold)', letterSpacing: '2px' }}>CÂU CHUYỆN SẢN PHẨM</label>
                <textarea className="luxury-input-field" style={{ height: '120px', resize: 'none' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="luxury-button-gold" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'ĐANG LƯU...' : (editingProduct ? 'CẬP NHẬT KIỆT TÁC' : 'TẠO MỚI')}
                </button>
                {editingProduct && <button type="button" className="luxury-input-field" style={{ color: '#e74c3c' }} onClick={() => handleDelete(editingProduct.id)}>XÓA</button>}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsTab;
