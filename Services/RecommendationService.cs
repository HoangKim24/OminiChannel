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
        public Perfume Perfume { get; set; }
        public int MatchScore { get; set; }
    }

    public class RecommendationService
    {
        private readonly OmnichannelDbContext _context;

        public RecommendationService(OmnichannelDbContext context)
        {
            _context = context;
        }

        public async Task<List<RecommendedPerfumeDto>> GetRecommendationsAsync(RecommendationRequest request, int limit = 5)
        {
            var query = _context.Perfumes.AsNoTracking();

            if (!string.IsNullOrEmpty(request.Gender))
            {
                query = query.Where(p => p.Gender == request.Gender || p.Gender == "Unisex");
            }

            // Note: Since ScentFamily isn't explicitly in the current Perfume Model, skipping until added to model
            // if (!string.IsNullOrEmpty(request.ScentFamily)) { ... }

            if (request.PreferredNotes != null && request.PreferredNotes.Any())
            {
                var upperNotes = request.PreferredNotes.Select(n => n.ToUpper()).ToList();

                query = query.Where(p =>
                    upperNotes.Any(note => p.TopNotes != null && p.TopNotes.ToUpper().Contains(note)) ||
                    upperNotes.Any(note => p.MiddleNotes != null && p.MiddleNotes.ToUpper().Contains(note)) ||
                    upperNotes.Any(note => p.BaseNotes != null && p.BaseNotes.ToUpper().Contains(note))
                );
            }

            var candidatePerfumes = await query.ToListAsync();

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
    }
}
