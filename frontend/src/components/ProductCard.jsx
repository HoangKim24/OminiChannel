import './ProductCard.css';

const ProductCard = ({ 
  image, 
  brand, 
  name, 
  price, 
  tags, 
  onAddToCart 
}) => {
  return (
    <div className="product-card">
      <div className="product-image-container">
        <img src={image} alt={name} className="product-image" />
      </div>
      <div className="product-info">
        <p className="product-brand">{brand}</p>
        <h3 className="product-name">{name}</h3>
        <div className="product-tags">
          {tags?.map((tag, index) => (
            <span key={index} className="product-tag">{tag}</span>
          ))}
        </div>
        <div className="product-footer">
          <span className="product-price">{price}</span>
          <button 
            className="add-to-cart-btn" 
            onClick={onAddToCart} 
            aria-label="Add to cart"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
