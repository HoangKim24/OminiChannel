using Microsoft.EntityFrameworkCore;
using Omnichannel.Models;
using System.Collections.Generic;
using System.Linq;
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

        public async Task<IEnumerable<SalesChannel>> GetAllAsync()
        {
            return await _context.SalesChannels.ToListAsync();
        }

        public async Task<SalesChannel?> GetByIdAsync(int id)
        {
            return await _context.SalesChannels.FindAsync(id);
        }

        public async Task AddAsync(SalesChannel entity)
        {
            await _context.SalesChannels.AddAsync(entity);
        }

        public void Update(SalesChannel entity)
        {
            _context.SalesChannels.Update(entity);
        }

        public void Delete(SalesChannel entity)
        {
            _context.SalesChannels.Remove(entity);
        }

        public async Task<IEnumerable<ChannelProduct>> GetChannelProductsAsync(int channelId)
        {
            return await _context.ChannelProducts
                .Include(cp => cp.Perfume)
                .Include(cp => cp.SalesChannel)
                .Where(cp => cp.SalesChannelId == channelId)
                .ToListAsync();
        }

        public async Task<IEnumerable<ChannelOrder>> GetChannelOrdersAsync(int channelId)
        {
            return await _context.ChannelOrders
                .Include(co => co.Order)
                    .ThenInclude(o => o!.Items)
                .Include(co => co.SalesChannel)
                .Where(co => co.SalesChannelId == channelId)
                .ToListAsync();
        }

        public async Task<ChannelProduct?> GetChannelProductAsync(int channelId, int perfumeId)
        {
            return await _context.ChannelProducts
                .FirstOrDefaultAsync(cp => cp.SalesChannelId == channelId && cp.PerfumeId == perfumeId);
        }

        public async Task AddChannelProductAsync(ChannelProduct channelProduct)
        {
            await _context.ChannelProducts.AddAsync(channelProduct);
        }

        public async Task AddChannelOrderAsync(ChannelOrder channelOrder)
        {
            await _context.ChannelOrders.AddAsync(channelOrder);
        }

        public void UpdateChannelProduct(ChannelProduct channelProduct)
        {
            _context.ChannelProducts.Update(channelProduct);
        }
    }
}
