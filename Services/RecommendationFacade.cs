using Omnichannel.Infrastructure;
using Omnichannel.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Omnichannel.Services
{
    /// <summary>
    /// Facade Pattern Implementation: Simplifies recommendation system complexity
    /// Coordinates RecommendationService with other services and repositories
    /// Provides a single entry point for getting recommendations in various ways
    /// </summary>
    public interface IRecommendationFacade
    {
        /// <summary>
        /// Get product recommendations for display (combines all algorithms)
        /// Primary endpoint for ProductDetail page
        /// </summary>
        Task<List<PerfumeBasicDto>> GetProductRecommendationsAsync(int perfumeId, int limit = 5);

        /// <summary>
        /// Get recommendations based on customer preference input
        /// Used for preference-based recommendation form
        /// </summary>
        Task<List<RecommendedPerfumeDto>> GetPreferenceBasedRecommendationsAsync(
            RecommendationRequest request, int limit = 5);
    }

    public class RecommendationFacade : IRecommendationFacade
    {
        private readonly RecommendationService _recommendationService;
        private readonly IUnitOfWork _unitOfWork;

        public RecommendationFacade(
            RecommendationService recommendationService,
            IUnitOfWork unitOfWork)
        {
            _recommendationService = recommendationService;
            _unitOfWork = unitOfWork;
        }

        /// <summary>
        /// Main recommendation endpoint: combines all strategies
        /// Strategy:
        /// 1. First try to get co-occurrence recommendations (customers also bought)
        /// 2. If insufficient, fill with related products (similar attributes)
        /// 3. Return top N deduplicated results
        /// </summary>
        public async Task<List<PerfumeBasicDto>> GetProductRecommendationsAsync(int perfumeId, int limit = 5)
        {
            // Validate perfume exists
            var perfume = await _unitOfWork.Perfumes.GetByIdAsync(perfumeId);
            if (perfume == null)
                return new List<PerfumeBasicDto>();

            try
            {
                // Use combined recommendations (co-occurrence + related)
                var recommendations = await _recommendationService.GetCombinedRecommendationsAsync(perfumeId, limit);
                return recommendations;
            }
            catch (System.Exception)
            {
                // Fallback to related products if co-occurrence data unavailable
                var fallbackRecs = await _recommendationService.GetRelatedProductsAsync(perfumeId, limit);
                return fallbackRecs;
            }
        }

        /// <summary>
        /// Preference-based recommendations
        /// Takes customer input (preferred notes, gender, etc.)
        /// Returns matching products ranked by similarity score
        /// </summary>
        public async Task<List<RecommendedPerfumeDto>> GetPreferenceBasedRecommendationsAsync(
            RecommendationRequest request, int limit = 5)
        {
            if (request == null)
                return new List<RecommendedPerfumeDto>();

            try
            {
                var recommendations = await _recommendationService.GetRecommendationsByNotesAsync(request, limit);
                return recommendations;
            }
            catch (System.Exception)
            {
                return new List<RecommendedPerfumeDto>();
            }
        }
    }
}
