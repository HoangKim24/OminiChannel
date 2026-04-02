using Omnichannel.Infrastructure;
using Omnichannel.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;

namespace Omnichannel.Repositories
{
    public class SqlRecommendationRepository : IRecommendationRepository
    {
        private readonly OmnichannelDbContext _context;

        public SqlRecommendationRepository(OmnichannelDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Recommendation>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Set<Recommendation>()
                .Include(r => r.RecommendedPerfume)
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        public async Task<PaginatedResult<Recommendation>> GetPaginatedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
        {
            var query = _context.Set<Recommendation>().AsNoTracking();
            var totalCount = await query.CountAsync(cancellationToken);
            var data = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(r => r.RecommendedPerfume)
                .ToListAsync(cancellationToken);

            return new PaginatedResult<Recommendation>
            {
                Data = data,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<Recommendation?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Set<Recommendation>()
                .Include(r => r.RecommendedPerfume)
                .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
        }

        public async Task AddAsync(Recommendation entity, CancellationToken cancellationToken = default)
        {
            await _context.Set<Recommendation>().AddAsync(entity, cancellationToken);
        }

        public void Update(Recommendation entity)
        {
            _context.Set<Recommendation>().Update(entity);
        }

        public void Delete(Recommendation entity)
        {
            _context.Set<Recommendation>().Remove(entity);
        }

        public async Task<List<Recommendation>> GetRecommendationsBySourceIdAsync(int sourcePerfumeId, int? limit = null)
        {
            var query = _context.Set<Recommendation>()
                .Where(r => r.SourcePerfumeId == sourcePerfumeId)
                .OrderByDescending(r => r.CoOccurrenceScore)
                .AsQueryable();

            if (limit.HasValue)
            {
                query = query.Take(limit.Value);
            }

            return await query
                .Include(r => r.RecommendedPerfume)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Recommendation?> GetBySourceAndRecommendedAsync(int sourcePerfumeId, int recommendedPerfumeId)
        {
            return await _context.Set<Recommendation>()
                .FirstOrDefaultAsync(r => 
                    r.SourcePerfumeId == sourcePerfumeId && 
                    r.RecommendedPerfumeId == recommendedPerfumeId);
        }

        public async Task<Recommendation> UpsertRecommendationAsync(int sourcePerfumeId, int recommendedPerfumeId, int score, string type)
        {
            var existing = await GetBySourceAndRecommendedAsync(sourcePerfumeId, recommendedPerfumeId);
            
            if (existing != null)
            {
                existing.CoOccurrenceScore = score;
                existing.Type = type;
                existing.LastUpdated = DateTime.UtcNow;
                _context.Set<Recommendation>().Update(existing);
                return existing;
            }

            var recommendation = new Recommendation
            {
                SourcePerfumeId = sourcePerfumeId,
                RecommendedPerfumeId = recommendedPerfumeId,
                CoOccurrenceScore = score,
                Type = type,
                LastUpdated = DateTime.UtcNow
            };

            await _context.Set<Recommendation>().AddAsync(recommendation);
            return recommendation;
        }
    }
}
