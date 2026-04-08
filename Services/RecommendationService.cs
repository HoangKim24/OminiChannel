using Microsoft.EntityFrameworkCore;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Omnichannel.Services
{
    public class RecommendationRequest
    {
        public List<string> PreferredNotes { get; set; } = new List<string>();
        public string? Gender { get; set; }
        public string? ScentFamily { get; set; }
    }

    public class RecommendedPerfumeDto
    {
        public required Perfume Perfume { get; set; }
        public int MatchScore { get; set; }
    }

    public class PerfumeBasicDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public int Score { get; set; } // Recommendation score 0-100
    }

    /// <summary>
    /// Service for generating product recommendations using multiple algorithms
    /// Supports: 1) Note-based matching, 2) Customer co-purchase patterns, 3) Related products
    /// </summary>
    public class RecommendationService
    {
        private readonly OmnichannelDbContext _context;
        private readonly IUnitOfWork? _unitOfWork;

        public RecommendationService(OmnichannelDbContext context, IUnitOfWork? unitOfWork = null)
        {
            _context = context;
            _unitOfWork = unitOfWork;
        }

        /// <summary>
        /// Algorithm 1: Note-based recommendations (existing implementation)
        /// Finds perfumes matching user's preferred notes
        /// </summary>
        public async Task<List<RecommendedPerfumeDto>> GetRecommendationsByNotesAsync(RecommendationRequest request, int limit = 5)
        {
            var query = _context.Perfumes.AsNoTracking();

            if (!string.IsNullOrEmpty(request.Gender))
            {
                query = query.Where(p => p.Gender == request.Gender || p.Gender == "Unisex");
            }

            // Notes are stored as free-text/comma-separated strings, so keep note matching in-memory for reliability.
            // Cap candidate set to avoid loading an unbounded catalog.
            var candidatePerfumes = await query
                .OrderBy(p => p.Id)
                .Take(500)
                .ToListAsync();

            if (request.PreferredNotes != null && request.PreferredNotes.Any())
            {
                var upperNotes = request.PreferredNotes.Select(n => n.ToUpper()).ToList();

                candidatePerfumes = candidatePerfumes.Where(p =>
                    upperNotes.Any(note => p.TopNotes != null && p.TopNotes.ToUpper().Contains(note)) ||
                    upperNotes.Any(note => p.MiddleNotes != null && p.MiddleNotes.ToUpper().Contains(note)) ||
                    upperNotes.Any(note => p.BaseNotes != null && p.BaseNotes.ToUpper().Contains(note))
                ).ToList();
            }

            var scoredPerfumes = candidatePerfumes.Select(p =>
            {
                int score = 0;
                var topNotes = p.TopNotes?.ToUpper() ?? "";
                var middleNotes = p.MiddleNotes?.ToUpper() ?? "";
                var baseNotes = p.BaseNotes?.ToUpper() ?? "";

                foreach (var note in request.PreferredNotes!)
                {
                    var upperNote = note.ToUpper();
                    
                    if (topNotes.Contains(upperNote)) score += 1;
                    if (middleNotes.Contains(upperNote)) score += 2; // Higher weight for middle/heart notes
                    if (baseNotes.Contains(upperNote)) score += 1;
                }

                return new RecommendedPerfumeDto
                {
                    Perfume = p,
                    MatchScore = score
                };
            })
            .Where(x => x.MatchScore > 0)
            .OrderByDescending(x => x.MatchScore)
            .Take(limit)
            .ToList();

            return scoredPerfumes;
        }

        /// <summary>
        /// Algorithm 2: Co-occurrence based recommendations
        /// Returns products frequently bought together with the source product
        /// Uses Recommendation table (populated by RefreshRecommendationMatrix)
        /// </summary>
        public async Task<List<PerfumeBasicDto>> GetCoOccurrenceRecommendationsAsync(int perfumeId, int limit = 5)
        {
            if (_unitOfWork == null)
                return new List<PerfumeBasicDto>();

            var recommendations = await _unitOfWork.Recommendations.GetRecommendationsBySourceIdAsync(perfumeId, limit);

            var result = recommendations
                .Select(r => new PerfumeBasicDto
                {
                    Id = r.RecommendedPerfume!.Id,
                    Name = r.RecommendedPerfume.Name,
                    Brand = r.RecommendedPerfume.Brand,
                    Price = r.RecommendedPerfume.Price,
                    ImageUrl = r.RecommendedPerfume.ImageUrl,
                    Score = r.CoOccurrenceScore
                })
                .ToList();

            return result;
        }

        /// <summary>
        /// Algorithm 3: Related products by attributes
        /// Finds products with similar category, gender, or scent notes
        /// </summary>
        public async Task<List<PerfumeBasicDto>> GetRelatedProductsAsync(int perfumeId, int limit = 5)
        {
            var allPerfumes = await _context.Perfumes.AsNoTracking().ToListAsync();
            var sourcePerfume = allPerfumes.FirstOrDefault(p => p.Id == perfumeId);

            if (sourcePerfume == null)
                return new List<PerfumeBasicDto>();

            // Rate products by similarity
            var relatedProducts = allPerfumes
                .Where(p => p.Id != perfumeId && p.StockQuantity > 0)
                .Select(p => new
                {
                    Perfume = p,
                    Score = CalculateSimilarityScore(p, sourcePerfume)
                })
                .Where(x => x.Score > 0)
                .OrderByDescending(x => x.Score)
                .Take(limit)
                .Select(x => new PerfumeBasicDto
                {
                    Id = x.Perfume.Id,
                    Name = x.Perfume.Name,
                    Brand = x.Perfume.Brand,
                    Price = x.Perfume.Price,
                    ImageUrl = x.Perfume.ImageUrl,
                    Score = x.Score
                })
                .ToList();

            return relatedProducts;
        }

        /// <summary>
        /// Combined recommendations: merge all three algorithms
        /// Used as the primary recommendation endpoint
        /// </summary>
        public async Task<List<PerfumeBasicDto>> GetCombinedRecommendationsAsync(int perfumeId, int limit = 5)
        {
            // First try co-occurrence recommendations
            var coOccurrenceRecs = await GetCoOccurrenceRecommendationsAsync(perfumeId, limit);
            
            if (coOccurrenceRecs.Count >= limit)
                return coOccurrenceRecs;

            // Fill gaps with related products
            var relatedRecs = await GetRelatedProductsAsync(perfumeId, limit - coOccurrenceRecs.Count);
            
            return coOccurrenceRecs.Concat(relatedRecs)
                .DistinctBy(p => p.Id)
                .Take(limit)
                .ToList();
        }

        /// <summary>
        /// Refresh recommendation matrix: rebuild co-occurrence data from order history
        /// Should be called daily as a scheduled background job
        /// </summary>
        public async Task RefreshRecommendationMatrixAsync()
        {
            if (_unitOfWork == null)
                return;

            // Get all orders with items
            var allOrders = (await _unitOfWork.Orders.GetAllAsync()).ToList();
            var allPerfumes = (await _unitOfWork.Perfumes.GetAllAsync()).ToList();

            // Clear old recommendations
            var existingRecs = (await _unitOfWork.Recommendations.GetAllAsync()).ToList();
            foreach (var rec in existingRecs)
            {
                _unitOfWork.Recommendations.Delete(rec);
            }

            // Rebuild from order history
            foreach (var perfume in allPerfumes)
            {
                var ordersWithThisPerfume = allOrders
                    .Where(o => o.Items.Any(oi => oi.PerfumeId == perfume.Id))
                    .ToList();

                if (!ordersWithThisPerfume.Any())
                    continue;

                // Count co-occurrences
                var coOccurrences = new Dictionary<int, int>();
                foreach (var order in ordersWithThisPerfume)
                {
                    var otherPerfumeIds = order.Items
                        .Where(oi => oi.PerfumeId != perfume.Id)
                        .Select(oi => oi.PerfumeId)
                        .Distinct();

                    foreach (var otherId in otherPerfumeIds)
                    {
                        if (!coOccurrences.ContainsKey(otherId))
                            coOccurrences[otherId] = 0;
                        coOccurrences[otherId]++;
                    }
                }

                // Save top recommendations
                var topCoOccurrences = coOccurrences
                    .OrderByDescending(kvp => kvp.Value)
                    .Take(10)
                    .ToList();

                foreach (var (recommendedId, count) in topCoOccurrences)
                {
                    var score = (int)System.Math.Round((double)count / ordersWithThisPerfume.Count * 100);
                    await _unitOfWork.Recommendations.UpsertRecommendationAsync(
                        perfume.Id, recommendedId, System.Math.Min(score, 100), "CoSold");
                }
            }

            await _unitOfWork.CompleteAsync();
        }

        /// <summary>
        /// Helper: Calculate similarity score between two perfumes based on attributes
        /// </summary>
        private int CalculateSimilarityScore(Perfume product, Perfume sourceProduct)
        {
            int score = 0;

            // Category match: +40 points
            if (product.CategoryId == sourceProduct.CategoryId && product.CategoryId.HasValue)
                score += 40;

            // Gender match: +30 points
            if (product.Gender == sourceProduct.Gender)
                score += 30;

            // Brand match: +20 points
            if (product.Brand == sourceProduct.Brand)
                score += 20;

            // Top notes similarity: +10 points
            if (!string.IsNullOrEmpty(product.TopNotes) && !string.IsNullOrEmpty(sourceProduct.TopNotes))
            {
                var sourceTopNote = sourceProduct.TopNotes.Split(',').First().Trim();
                if (product.TopNotes.Contains(sourceTopNote))
                    score += 10;
            }

            return score;
        }
    }
}
