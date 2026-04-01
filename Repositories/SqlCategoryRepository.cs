using Microsoft.EntityFrameworkCore;
using Omnichannel.Models;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Omnichannel.Repositories
{
    public class SqlCategoryRepository : ICategoryRepository
    {
        private readonly Infrastructure.OmnichannelDbContext _context;

        public SqlCategoryRepository(Infrastructure.OmnichannelDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Category>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Categories.AsNoTracking().ToListAsync(cancellationToken);
        }

        public async Task<PaginatedResult<Category>> GetPaginatedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
        {
            var query = _context.Categories.AsNoTracking();
            var totalCount = await query.CountAsync(cancellationToken);
            var data = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

            return new PaginatedResult<Category>
            {
                Data = data,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<Category?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Categories.FindAsync(new object[] { id }, cancellationToken);
        }

        public async Task AddAsync(Category entity, CancellationToken cancellationToken = default)
        {
            await _context.Categories.AddAsync(entity, cancellationToken);
        }

        public void Update(Category entity)
        {
            _context.Categories.Update(entity);
        }

        public void Delete(Category entity)
        {
            _context.Categories.Remove(entity);
        }
    }
}
