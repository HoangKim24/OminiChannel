using Omnichannel.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Omnichannel.Repositories
{
    public interface IRecommendationRepository : IRepository<Recommendation>
    {
        /// <summary>
        /// Get recommendations for a specific perfume
        /// </summary>
        Task<List<Recommendation>> GetRecommendationsBySourceIdAsync(int sourcePerfumeId, int? limit = null);
        
        /// <summary>
        /// Find existing relationship between two products
        /// </summary>
        Task<Recommendation?> GetBySourceAndRecommendedAsync(int sourcePerfumeId, int recommendedPerfumeId);
        
        /// <summary>
        /// Update/create recommendation score
        /// </summary>
        Task<Recommendation> UpsertRecommendationAsync(int sourcePerfumeId, int recommendedPerfumeId, int score, string type);
    }
}
