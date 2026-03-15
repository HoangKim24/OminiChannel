using Omnichannel.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Omnichannel.Repositories
{
    public interface ISalesChannelRepository : IRepository<SalesChannel>
    {
        Task<IEnumerable<ChannelProduct>> GetChannelProductsAsync(int channelId);
        Task<IEnumerable<ChannelOrder>> GetChannelOrdersAsync(int channelId);
        Task<ChannelProduct?> GetChannelProductAsync(int channelId, int perfumeId);
        Task AddChannelProductAsync(ChannelProduct channelProduct);
        Task AddChannelOrderAsync(ChannelOrder channelOrder);
        void UpdateChannelProduct(ChannelProduct channelProduct);
    }
}
