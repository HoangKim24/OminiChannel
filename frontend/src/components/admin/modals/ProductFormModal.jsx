const ProductFormModal = ({
  show,
  editingProduct,
  saving,
  formData,
  formErrors,
  categories,
  genderOptions,
  concentrationOptions,
  volumeRows,
  volumePreview,
  formatVnd,
  onClose,
  onSubmit,
  onDelete,
  onFieldChange,
  onAddVolumeRow,
  onRemoveVolumeRow,
  onUpdateVolumeRow,
}) => {
  if (!show) return null;

  return (
    <div className="admin-modal-overlay admin-modal-overlay-right">
      <div className="glass-panel fade-in-right admin-side-modal">
        <div className="admin-modal-head">
          <h2 className="brand-font admin-modal-title">
            {editingProduct ? 'Hồ Sơ Kiệt Tác' : 'Kiến Tạo Tuyệt Tác'}
          </h2>
          <button className="admin-modal-close" onClick={onClose}>×</button>
        </div>

        <form className="admin-modal-form" onSubmit={onSubmit}>
          {formErrors.form ? <p className="products-form-error">{formErrors.form}</p> : null}

          <div className="input-group">
            <label className="admin-field-label">TÊN SẢN PHẨM</label>
            <input
              className="luxury-input-field admin-field-full"
              required
              value={formData.name}
              onChange={(e) => onFieldChange('name', e.target.value)}
              placeholder="Bleu de Chanel Parfum..."
            />
            {formErrors.name ? <p className="products-field-error">{formErrors.name}</p> : null}
          </div>

          <div className="admin-form-grid-2">
            <div className="input-group">
              <label className="admin-field-label">THƯƠNG HIỆU</label>
              <input className="luxury-input-field admin-field-full" value={formData.brand} onChange={(e) => onFieldChange('brand', e.target.value)} />
              {formErrors.brand ? <p className="products-field-error">{formErrors.brand}</p> : null}
            </div>
            <div className="input-group">
              <label className="admin-field-label">PHÂN LOẠI</label>
              <select className="luxury-input-field admin-field-full" value={formData.gender} onChange={(e) => onFieldChange('gender', e.target.value)}>
                {genderOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              {formErrors.gender ? <p className="products-field-error">{formErrors.gender}</p> : null}
            </div>
          </div>

          <div className="admin-form-grid-2">
            <div className="input-group">
              <label className="admin-field-label">DANH MỤC</label>
              <select
                className="luxury-input-field admin-field-full"
                value={formData.categoryId}
                onChange={(e) => onFieldChange('categoryId', e.target.value)}
              >
                <option value="">Chưa phân loại</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="admin-field-label">NỒNG ĐỘ</label>
              <select
                className="luxury-input-field admin-field-full"
                value={formData.concentration}
                onChange={(e) => onFieldChange('concentration', e.target.value)}
              >
                {concentrationOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              {formErrors.concentration ? <p className="products-field-error">{formErrors.concentration}</p> : null}
            </div>
          </div>

          <div className="admin-form-grid-2">
            <div className="input-group">
              <label className="admin-field-label">GIÁ NIÊM YẾT</label>
              <input
                inputMode="decimal"
                className="luxury-input-field admin-field-full"
                required
                value={formData.price}
                onChange={(e) => onFieldChange('price', e.target.value)}
                placeholder="Ví dụ: 1899000"
              />
              <p className="products-field-hint">{formatVnd(formData.price || 0)}</p>
              {formErrors.price ? <p className="products-field-error">{formErrors.price}</p> : null}
            </div>
            <div className="input-group">
              <label className="admin-field-label">SỐ LƯỢNG KHO</label>
              <input
                inputMode="numeric"
                className="luxury-input-field admin-field-full"
                value={formData.stockQuantity}
                onChange={(e) => onFieldChange('stockQuantity', e.target.value)}
                placeholder="Ví dụ: 120"
              />
              {formErrors.stockQuantity ? <p className="products-field-error">{formErrors.stockQuantity}</p> : null}
            </div>
          </div>

          <div className="input-group">
            <label className="admin-field-label">LINK HÌNH ẢNH</label>
            <input
              className="luxury-input-field admin-field-full"
              value={formData.imageUrl}
              onChange={(e) => onFieldChange('imageUrl', e.target.value)}
              placeholder="https://..."
            />
            <p className="products-field-hint">Nếu để trống, hệ thống dùng ảnh mặc định.</p>
            {formErrors.imageUrl ? <p className="products-field-error">{formErrors.imageUrl}</p> : null}
          </div>

          <section className="admin-modal-subpanel products-scent-panel">
            <h4 className="brand-font admin-modal-subtitle">Scent Profile (Tầng Hương)</h4>
            <div className="admin-modal-stack products-scent-grid">
              <div className="input-group">
                <label className="admin-field-label">TOP NOTES</label>
                <input className="luxury-input-field" placeholder="Citrus, Mint, Pink Pepper" value={formData.topNotes} onChange={(e) => onFieldChange('topNotes', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="admin-field-label">MIDDLE NOTES</label>
                <input className="luxury-input-field" placeholder="Rose, Jasmine, Lavender" value={formData.middleNotes} onChange={(e) => onFieldChange('middleNotes', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="admin-field-label">BASE NOTES</label>
                <input className="luxury-input-field" placeholder="Sandalwood, Cedar, White Musk" value={formData.baseNotes} onChange={(e) => onFieldChange('baseNotes', e.target.value)} />
              </div>
            </div>
          </section>

          <section className="admin-modal-subpanel products-volume-panel">
            <div className="products-volume-header">
              <h4 className="brand-font admin-modal-subtitle">Tùy chọn dung tích</h4>
              <button type="button" className="luxury-input-field products-add-size-btn" onClick={onAddVolumeRow}>+ Thêm dòng</button>
            </div>

            <div className="products-volume-list">
              {volumeRows.map((row) => (
                <div key={row.id} className="products-volume-row">
                  <div className="input-group">
                    <label className="admin-field-label">Dung tích (ml)</label>
                    <input
                      inputMode="numeric"
                      className="luxury-input-field"
                      value={row.ml}
                      onChange={(e) => onUpdateVolumeRow(row.id, 'ml', e.target.value)}
                      placeholder="50"
                    />
                  </div>
                  <div className="input-group">
                    <label className="admin-field-label">Hệ số giá</label>
                    <input
                      inputMode="decimal"
                      className="luxury-input-field"
                      value={row.factor}
                      onChange={(e) => onUpdateVolumeRow(row.id, 'factor', e.target.value)}
                      placeholder="1.0"
                    />
                  </div>
                  <button
                    type="button"
                    className="luxury-input-field products-remove-size-btn"
                    onClick={() => onRemoveVolumeRow(row.id)}
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
            <p className="products-field-hint products-volume-preview">Format gửi backend: {volumePreview || 'Không có'}</p>
            {formErrors.volumeOptions ? <p className="products-field-error">{formErrors.volumeOptions}</p> : null}
          </section>

          <div className="admin-form-grid-2">
            <div className="input-group">
              <label className="admin-field-label">XUẤT XỨ</label>
              <input className="luxury-input-field admin-field-full" value={formData.origin} onChange={(e) => onFieldChange('origin', e.target.value)} placeholder="France / Italy / Spain" />
            </div>
            <div className="input-group">
              <label className="admin-field-label">CÂU CHUYỆN THƯƠNG HIỆU</label>
              <input className="luxury-input-field admin-field-full" value={formData.brandStory} onChange={(e) => onFieldChange('brandStory', e.target.value)} placeholder="Ngắn gọn mô tả cảm hứng sản phẩm" />
            </div>
          </div>

          <div className="input-group">
            <label className="admin-field-label">CÂU CHUYỆN SẢN PHẨM</label>
            <textarea className="luxury-input-field admin-modal-textarea" value={formData.description} onChange={(e) => onFieldChange('description', e.target.value)}></textarea>
          </div>

          <div className="admin-modal-actions products-form-actions">
            <button type="button" className="luxury-input-field" onClick={onClose} disabled={saving}>HỦY</button>
            <button type="submit" className="luxury-button-gold products-save-btn" disabled={saving}>
              {saving ? 'ĐANG LƯU...' : (editingProduct ? 'CẬP NHẬT KIỆT TÁC' : 'TẠO MỚI')}
            </button>
            {editingProduct ? <button type="button" className="luxury-input-field status-critical" onClick={() => onDelete(editingProduct.id)}>XÓA</button> : null}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
