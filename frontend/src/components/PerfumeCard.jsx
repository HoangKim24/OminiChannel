import { useAppStore } from '../store/useAppStore';
import './PerfumeCard.css';

const PerfumeCard = ({ product }) => {
  const addToCart = useAppStore(state => state.addToCart);
  const showToast = useAppStore(state => state.showToast);

  const handleAddToCart = () => {
    if (!product?.id) {
      showToast('Sản phẩm không hợp lệ', 'error');
      return;
    }
    addToCart(product, 1);
    showToast(`✨ Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  // Defensive fallbacks for data
  const {
    image = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop',
    name = 'Unknown Perfume',
    brand = 'LUXURY BRAND',
    concentration = 'EDP', // EDP (Eau de Parfum), EDT, etc.
    price = 0,
    topNote = 'Citrus',
    middleNote = 'Rose',
    baseNote = 'Oud Wood'
  } = product || {};

  return (
    <div className="perfume-card">
      {/* Product Image Region */}
      <div className="perfume-image-wrapper">
        <img src={image} alt={name} className="perfume-image" />
        
        {/* Hidden Add to cart layer that slides up on hover */}
        <div className="perfume-action-layer">
          <button className="perfume-add-btn" onClick={handleAddToCart}>
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>

      {/* Product Info Region */}
      <div className="perfume-info">
        <div className="perfume-header-top">
          <span className="perfume-brand">{brand}</span>
          <span className="perfume-concentration">{concentration}</span>
        </div>
        
        <h3 className="perfume-name">{name}</h3>
        
        {/* Scent Notes Tags */}
        <div className="perfume-notes">
          <span className="note-badge top-note" title="Hương đầu">T: {topNote}</span>
          <span className="note-badge middle-note" title="Hương giữa">M: {middleNote}</span>
          <span className="note-badge base-note" title="Hương cuối">B: {baseNote}</span>
        </div>

        <div className="perfume-price">
          ${Number(price).toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default PerfumeCard;
