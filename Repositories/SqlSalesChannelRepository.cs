using Microsoft.EntityFrameworkCore;
using Omnichannel.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Omnichannel.Repositories
{
    public class SqlSalesChannelRepository : ISalesChannelRepository
    {
        private readonly Infrastructure.OmnichannelDbContext _context;

        public SqlSalesChannelRepository(Infrastructure.OmnichannelDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SalesChannel>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SalesChannels.AsNoTracking().ToListAsync(cancellationToken);
        }

        public async Task<PaginatedResult<SalesChannel>> GetPaginatedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
        {
            var query = _context.SalesChannels
                .AsNoTracking()
                .OrderBy(channel => channel.Id);
            var totalCount = await query.CountAsync(cancellationToken);
            var data = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

            return new PaginatedResult<SalesChannel>
            {
                Data = data,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<SalesChannel?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.SalesChannels.FindAsync(new object[] { id }, cancellationToken);
        }

        public async Task AddAsync(SalesChannel entity, CancellationToken cancellationToken = default)
        {
            await _context.SalesChannels.AddAsync(entity, cancellationToken);
        }

        public void Update(SalesChannel entity)
        {
            _context.SalesChannels.Update(entity);
        }

        public void Delete(SalesChannel entity)
        {
            _context.SalesChannels.Remove(entity);
        }

        public async Task<IEnumerable<ChannelProduct>> GetChannelProductsAsync(int channelId, CancellationToken cancellationToken = default)
        {
            return await _context.ChannelProducts
                .Include(cp => cp.Perfume)
                .Include(cp => cp.SalesChannel)
                .AsNoTracking()
                .Where(cp => cp.SalesChannelId == channelId)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<ChannelOrder>> GetChannelOrdersAsync(int channelId, CancellationToken cancellationToken = default)
        {
            return await _context.ChannelOrders
                .Include(co => co.Order)
                    .ThenInclude(o => o!.Items)
                .Include(co => co.SalesChannel)
                .AsNoTracking()
                .Where(co => co.SalesChannelId == channelId)
                .ToListAsync(cancellationToken);
        }

        public async Task<ChannelProduct?> GetChannelProductAsync(int channelId, int perfumeId, CancellationToken cancellationToken = default)
        {
            return await _context.ChannelProducts
                .FirstOrDefaultAsync(cp => cp.SalesChannelId == channelId && cp.PerfumeId == perfumeId, cancellationToken);
        }

        public async Task AddChannelProductAsync(ChannelProduct channelProduct, CancellationToken cancellationToken = default)
        {
            await _context.ChannelProducts.AddAsync(channelProduct, cancellationToken);
        }

        public async Task AddChannelOrderAsync(ChannelOrder channelOrder, CancellationToken cancellationToken = default)
        {
            await _context.ChannelOrders.AddAsync(channelOrder, cancellationToken);
        }

        public void UpdateChannelProduct(ChannelProduct channelProduct)
        {
            _context.ChannelProducts.Update(channelProduct);
        }
    }
}
