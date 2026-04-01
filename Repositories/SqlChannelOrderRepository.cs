using Microsoft.EntityFrameworkCore;
using Omnichannel.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Omnichannel.Repositories
{
    public class SqlChannelOrderRepository : IChannelOrderRepository
    {
        private readonly Infrastructure.OmnichannelDbContext _context;

        public SqlChannelOrderRepository(Infrastructure.OmnichannelDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ChannelOrder>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.ChannelOrders
                .Include(x => x.Order)
                .Include(x => x.SalesChannel)
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        public async Task<PaginatedResult<ChannelOrder>> GetPaginatedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
        {
            var query = _context.ChannelOrders
                .Include(x => x.Order)
                .Include(x => x.SalesChannel)
                .AsNoTracking();

            var totalCount = await query.CountAsync(cancellationToken);
            var data = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

            return new PaginatedResult<ChannelOrder>
            {
                Data = data,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<ChannelOrder?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.ChannelOrders
                .Include(x => x.Order)
                .Include(x => x.SalesChannel)
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        }

        public async Task AddAsync(ChannelOrder entity, CancellationToken cancellationToken = default)
        {
            await _context.ChannelOrders.AddAsync(entity, cancellationToken);
        }

        public void Update(ChannelOrder entity)
        {
            _context.ChannelOrders.Update(entity);
        }

        public void Delete(ChannelOrder entity)
        {
            _context.ChannelOrders.Remove(entity);
        }

        public async Task<IEnumerable<ChannelOrder>> GetByChannelIdAsync(int channelId, CancellationToken cancellationToken = default)
        {
            return await _context.ChannelOrders
                .Include(x => x.Order)
                .AsNoTracking()
                .Where(x => x.SalesChannelId == channelId)
                .ToListAsync(cancellationToken);
        }

        public async Task<ChannelOrder?> GetByExternalOrderIdAsync(string externalOrderId, CancellationToken cancellationToken = default)
        {
            return await _context.ChannelOrders
                .FirstOrDefaultAsync(x => x.ExternalOrderId == externalOrderId, cancellationToken);
        }
    }
}
