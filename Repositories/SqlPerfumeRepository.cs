using Microsoft.EntityFrameworkCore;
using Omnichannel.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Omnichannel.Repositories
{
    public class SqlPerfumeRepository : IPerfumeRepository
    {
        private readonly Infrastructure.OmnichannelDbContext _context;

        public SqlPerfumeRepository(Infrastructure.OmnichannelDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Perfume>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Perfumes.Include(p => p.Category).AsNoTracking().ToListAsync(cancellationToken);
        }

        public async Task<PaginatedResult<Perfume>> GetPaginatedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
        {
            var query = _context.Perfumes.Include(p => p.Category).AsNoTracking();
            var totalCount = await query.CountAsync(cancellationToken);
            var data = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
            
            return new PaginatedResult<Perfume> 
            { 
                Data = data, 
                TotalCount = totalCount, 
                Page = page, 
                PageSize = pageSize 
            };
        }

        public async Task<Perfume?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Perfumes.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        }

        public async Task AddAsync(Perfume entity, CancellationToken cancellationToken = default)
        {
            await _context.Perfumes.AddAsync(entity, cancellationToken);
        }

        public void Update(Perfume entity)
        {
            _context.Perfumes.Update(entity);
        }

        public void Delete(Perfume entity)
        {
            _context.Perfumes.Remove(entity);
        }

        public async Task<IEnumerable<Perfume>> GetByCategoryAsync(string categoryName, CancellationToken cancellationToken = default)
        {
            return await _context.Perfumes
                .Include(p => p.Category)
                .AsNoTracking()
                .Where(p => p.Category != null && p.Category.CategoryName == categoryName)
                .ToListAsync(cancellationToken);
        }
    }
}
