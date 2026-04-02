import { useEffect, useState } from 'react';
import '/src/styles/recommendation.css';

/**
 * Recommendation Component
 * Displays product recommendations using the RecommendationFacade API
 * Supports multiple algorithms: co-occurrence + attribute-based
 */
export default function RecommendationSection({ perfumeId }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!perfumeId) return;

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/perfumes/${perfumeId}/recommendations?limit=4`
        );

        if (!response.ok) {
          throw new Error('Không thể tải gợi ý sản phẩm');
        }

        const data = await response.json();
        
        // Ensure recommendations is always an array
        const recs = Array.isArray(data.recommendations) ? data.recommendations : [];
        setRecommendations(recs);
      } catch (err) {
        console.error('Recommendation fetch error:', err);
        setError(err.message);
        setRecommendations([]); // fallback to empty array
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [perfumeId]);

  // Don't render section if no recommendations
  if (!loading && recommendations.length === 0 && !error) {
    return null;
  }

  return (
    <section className="recommendation-section">
      <div className="recommendation-header">
        <h2 className="recommendation-title">
          💡 Gợi ý sản phẩm tương tự
        </h2>
        <p className="recommendation-subtitle">
          Những khách hàng cũng quan tâm đến những sản phẩm này
        </p>
      </div>

      {loading ? (
        <div className="recommendation-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải gợi ý...</p>
        </div>
      ) : error ? (
        <div className="recommendation-error">
          <p>⚠️ {error}</p>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="recommendation-grid">
          {recommendations.map((product) => (
            <RecommendationCard key={product.id} product={product} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

/**
 * Individual Recommendation Card
 * Displays product with recommendation score
 */
function RecommendationCard({ product }) {
  return (
    <div className="recommendation-card">
      <div className="recommendation-card-image">
        <img 
          src={product.imageUrl || '/default-perfume.png'} 
          alt={product.name}
          className="recommendation-img"
        />
        {product.score && (
          <div className="recommendation-score">
            <span className="score-badge">{product.score}%</span>
          </div>
        )}
      </div>

      <div className="recommendation-card-content">
        <h3 className="recommendation-product-name">{product.name}</h3>
        <p className="recommendation-brand">{product.brand}</p>
        
        <div className="recommendation-price">
          <strong>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(product.price)}
          </strong>
        </div>

        <a 
          href={`/product/${product.id}`}
          className="recommendation-link"
        >
          Xem chi tiết →
        </a>
      </div>
    </div>
  );
}
