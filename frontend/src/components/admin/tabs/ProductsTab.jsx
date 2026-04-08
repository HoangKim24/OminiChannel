import { useCallback, useMemo, useState } from 'react';
import { useToast } from '../../../utils/useToast.jsx';
import ProductFormModal from '../modals/ProductFormModal.jsx';

const formatVnd = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price || 0));

const DEFAULT_IMAGE_URL = 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80';

const DEFAULT_FORM_DATA = {
  name: '',
  brand: 'KP',
  gender: 'Unisex',
  categoryId: '',
  price: '',
  stockQuantity: '',
  topNotes: '',
  middleNotes: '',
  baseNotes: '',
  concentration: 'EDP',
  description: '',
  imageUrl: '',
  origin: '',
  brandStory: '',
};

const GENDER_OPTIONS = ['Unisex', 'Nam', 'Nữ'];
const CONCENTRATION_OPTIONS = ['EDT', 'EDP', 'Parfum', 'Extrait'];
const PRESET_VOLUME_ROWS = [
  { id: 'size-30', ml: '30', factor: '0.7' },
  { id: 'size-50', ml: '50', factor: '1.0' },
  { id: 'size-100', ml: '100', factor: '1.6' },
];

const createVolumeRow = () => ({
  id: `size-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
  ml: '',
  factor: '',
});

const parseVolumeOptions = (value) => {
  if (!value || typeof value !== 'string') {
    return PRESET_VOLUME_ROWS.map((row) => ({ ...row }));
  }

  const rows = value
    .split(',')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk, index) => {
      const [rawMl, rawFactor] = chunk.split(':').map((part) => (part || '').trim());
      const mlValue = rawMl.toLowerCase().endsWith('ml') ? rawMl.slice(0, -2).trim() : rawMl;

      return {
        id: `size-${index}`,
        ml: mlValue,
        factor: rawFactor,
      };
    })
    .filter((item) => item.ml || item.factor);

  return rows.length > 0 ? rows : PRESET_VOLUME_ROWS.map((row) => ({ ...row }));
};

const serializeVolumeOptions = (rows) => {
  return rows
    .map((row) => ({
      ml: String(row.ml || '').trim(),
      factor: String(row.factor || '').trim(),
    }))
    .filter((row) => row.ml && row.factor)
    .map((row) => `${Number(row.ml)}ml:${Number(row.factor).toFixed(2).replace(/\.00$/, '.0').replace(/0$/, '')}`)
    .join(',');
};

const isValidHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const normalizeMoneyInput = (value) => value.replace(/[^0-9.]/g, '');
const normalizeIntegerInput = (value) => value.replace(/[^0-9]/g, '');

const ProductsTab = ({ products, user, onRefresh }) => {
  const { success, error } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [formErrors, setFormErrors] = useState({});
  const [volumeRows, setVolumeRows] = useState(PRESET_VOLUME_ROWS.map((row) => ({ ...row })));
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState('all');
  const [priceRange] = useState({ min: 0, max: 50000000 });

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) return;

      const payload = await response.json();
      if (!Array.isArray(payload)) return;

      setCategories(
        payload.map((item) => ({
          id: item.id ?? item.Id,
          name: item.categoryName ?? item.CategoryName ?? `Danh mục ${item.id ?? item.Id}`,
        }))
      );
    } catch {
      // Keep form usable even if category API is unavailable.
    }
  }, []);

  const setFieldValue = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: '', form: '' }));
  }, []);

  const handleFieldChange = useCallback((field, value) => {
    if (field === 'price') {
      setFieldValue(field, normalizeMoneyInput(value));
      return;
    }

    if (field === 'stockQuantity') {
      setFieldValue(field, normalizeIntegerInput(value));
      return;
    }

    setFieldValue(field, value);
  }, [setFieldValue]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(DEFAULT_FORM_DATA);
    setFormErrors({});
    setVolumeRows(PRESET_VOLUME_ROWS.map((row) => ({ ...row })));
    fetchCategories();
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      brand: product.brand || 'KP',
      gender: product.gender || 'Unisex',
      categoryId: product.categoryId ?? product.CategoryId ?? '',
      price: String(product.price ?? product.Price ?? ''),
      stockQuantity: String(product.stockQuantity ?? product.StockQuantity ?? ''),
      topNotes: product.topNotes || '',
      middleNotes: product.middleNotes || '',
      baseNotes: product.baseNotes || '',
      concentration: product.concentration || 'EDP',
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      origin: product.origin || '',
      brandStory: product.brandStory || '',
    });
    setVolumeRows(parseVolumeOptions(product.volumeOptions || product.VolumeOptions || ''));
    setFormErrors({});
    fetchCategories();
    setShowModal(true);
  };

  const addVolumeRow = () => {
    setVolumeRows((prev) => [...prev, createVolumeRow()]);
    setFormErrors((prev) => ({ ...prev, volumeOptions: '', form: '' }));
  };

  const removeVolumeRow = (id) => {
    setVolumeRows((prev) => {
      const next = prev.filter((row) => row.id !== id);
      return next.length > 0 ? next : [createVolumeRow()];
    });
    setFormErrors((prev) => ({ ...prev, volumeOptions: '', form: '' }));
  };

  const updateVolumeRow = (id, key, value) => {
    const normalized = key === 'ml' ? normalizeIntegerInput(value) : normalizeMoneyInput(value);
    setVolumeRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: normalized } : row)));
    setFormErrors((prev) => ({ ...prev, volumeOptions: '', form: '' }));
  };

  const validateForm = () => {
    const errors = {};
    const parsedPrice = Number(formData.price);
    const parsedStock = Number(formData.stockQuantity);
    const validVolumeRows = volumeRows.filter((row) => String(row.ml || '').trim() || String(row.factor || '').trim());

    if (!String(formData.name || '').trim()) {
      errors.name = 'Tên sản phẩm không được để trống.';
    }

    if (!String(formData.brand || '').trim()) {
      errors.brand = 'Thương hiệu không được để trống.';
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      errors.price = 'Giá niêm yết phải là số dương.';
    }

    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      errors.stockQuantity = 'Số lượng kho phải là số nguyên >= 0.';
    }

    if (String(formData.imageUrl || '').trim() && !isValidHttpUrl(String(formData.imageUrl || '').trim())) {
      errors.imageUrl = 'Link hình ảnh phải là URL hợp lệ (http/https).';
    }

    if (!GENDER_OPTIONS.includes(formData.gender)) {
      errors.gender = 'Phân loại không hợp lệ.';
    }

    if (!CONCENTRATION_OPTIONS.includes(formData.concentration)) {
      errors.concentration = 'Nồng độ không hợp lệ.';
    }

    if (validVolumeRows.length === 0) {
      errors.volumeOptions = 'Cần ít nhất 1 tùy chọn dung tích.';
    } else {
      const invalidVolume = validVolumeRows.find((row) => Number(row.ml) <= 0 || Number(row.factor) <= 0);
      if (invalidVolume) {
        errors.volumeOptions = 'Dung tích ml và hệ số giá đều phải > 0.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      error('Vui lòng kiểm tra lại thông tin sản phẩm.');
      return;
    }

    setSaving(true);
    try {
      const normalizedPrice = Number(formData.price);
      const normalizedStock = Number(formData.stockQuantity);
      const normalizedImageUrl = String(formData.imageUrl || '').trim() || DEFAULT_IMAGE_URL;
      const normalizedVolumeOptions = serializeVolumeOptions(volumeRows);
      const normalizedCategoryId = formData.categoryId === '' ? null : Number(formData.categoryId);

      const body = {
        ...(editingProduct ? { id: editingProduct.id } : {}),
        name: String(formData.name || '').trim(),
        brand: String(formData.brand || '').trim(),
        gender: formData.gender,
        price: normalizedPrice,
        stockQuantity: normalizedStock,
        topNotes: String(formData.topNotes || '').trim(),
        middleNotes: String(formData.middleNotes || '').trim(),
        baseNotes: String(formData.baseNotes || '').trim(),
        concentration: formData.concentration,
        volumeOptions: normalizedVolumeOptions,
        origin: String(formData.origin || '').trim(),
        brandStory: String(formData.brandStory || '').trim(),
        description: String(formData.description || '').trim(),
        imageUrl: normalizedImageUrl,
        categoryId: Number.isInteger(normalizedCategoryId) ? normalizedCategoryId : null,
      };

      const url = editingProduct ? `/api/perfumes/${editingProduct.id}` : '/api/perfumes';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method, headers: {
          'Content-Type': 'application/json',
          ...(user?.role ? { 'X-User-Role': user.role } : {}),
          ...(user?.accessToken ? { Authorization: `Bearer ${user.accessToken}` } : {}),
        },
        body: JSON.stringify(body)
      });

      if (res.ok || res.status === 201 || res.status === 204) {
        const message = editingProduct ? '✓ Cập nhật sản phẩm thành công!' : '✓ Thêm sản phẩm mới thành công!';
        success(message);
        setShowModal(false);
        setFormErrors({});
        if (onRefresh) onRefresh();
      } else {
        const err = await res.json().catch(() => ({}));
        const message = err.message || 'Lỗi khi lưu sản phẩm';
        setFormErrors((prev) => ({ ...prev, form: message }));
        error(message);
      }
    } catch (err) {
      const message = `Lỗi kết nối: ${err.message}`;
      setFormErrors((prev) => ({ ...prev, form: message }));
      error(message);
    }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      const res = await fetch(`/api/perfumes/${id}`, {
        method: 'DELETE', headers: {
          ...(user?.role ? { 'X-User-Role': user.role } : {}),
          ...(user?.accessToken ? { Authorization: `Bearer ${user.accessToken}` } : {}),
        }
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
               className="luxury-input-field admin-filter-input products-search-input"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
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
                    <div className="admin-order-code">{formatVnd(p.price)}</div>
                    <div className={`admin-stock-text ${p.stockQuantity < 5 ? 'status-critical' : ''}`}>
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

      <ProductFormModal
        show={showModal}
        editingProduct={editingProduct}
        saving={saving}
        formData={formData}
        formErrors={formErrors}
        categories={categories}
        genderOptions={GENDER_OPTIONS}
        concentrationOptions={CONCENTRATION_OPTIONS}
        volumeRows={volumeRows}
        volumePreview={serializeVolumeOptions(volumeRows)}
        formatVnd={formatVnd}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        onFieldChange={handleFieldChange}
        onAddVolumeRow={addVolumeRow}
        onRemoveVolumeRow={removeVolumeRow}
        onUpdateVolumeRow={updateVolumeRow}
      />
    </div>
  );
};

export default ProductsTab;

