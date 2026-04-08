using Microsoft.EntityFrameworkCore;
using Omnichannel.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Omnichannel.Repositories
{
    public class SqlChannelProductRepository : IChannelProductRepository
    {
        private readonly Infrastructure.OmnichannelDbContext _context;

        public SqlChannelProductRepository(Infrastructure.OmnichannelDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ChannelProduct>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.ChannelProducts
                .Include(x => x.Perfume)
                .Include(x => x.SalesChannel)
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        public async Task<PaginatedResult<ChannelProduct>> GetPaginatedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
        {
            var query = _context.ChannelProducts
                .Include(x => x.Perfume)
                .Include(x => x.SalesChannel)
                .AsNoTracking()
                .OrderBy(channelProduct => channelProduct.Id);

            var totalCount = await query.CountAsync(cancellationToken);
            var data = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

            return new PaginatedResult<ChannelProduct>
            {
                Data = data,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<ChannelProduct?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.ChannelProducts
                .Include(x => x.Perfume)
                .Include(x => x.SalesChannel)
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        }

        public async Task AddAsync(ChannelProduct entity, CancellationToken cancellationToken = default)
        {
            await _context.ChannelProducts.AddAsync(entity, cancellationToken);
        }

        public void Update(ChannelProduct entity)
        {
            _context.ChannelProducts.Update(entity);
        }

        public void Delete(ChannelProduct entity)
        {
            _context.ChannelProducts.Remove(entity);
        }

        public async Task<IEnumerable<ChannelProduct>> GetByChannelIdAsync(int channelId, CancellationToken cancellationToken = default)
        {
            return await _context.ChannelProducts
                .Include(x => x.Perfume)
                .AsNoTracking()
                .Where(x => x.SalesChannelId == channelId)
                .ToListAsync(cancellationToken);
        }

        public async Task<ChannelProduct?> GetByChannelAndPerfumeAsync(int channelId, int perfumeId, CancellationToken cancellationToken = default)
        {
            return await _context.ChannelProducts
                .FirstOrDefaultAsync(x => x.SalesChannelId == channelId && x.PerfumeId == perfumeId, cancellationToken);
        }
    }
}
