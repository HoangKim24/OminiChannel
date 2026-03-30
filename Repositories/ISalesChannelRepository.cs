using Omnichannel.Models;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Omnichannel.Repositories
{
    public interface ISalesChannelRepository : IRepository<SalesChannel>
    {
        Task<IEnumerable<ChannelProduct>> GetChannelProductsAsync(int channelId, CancellationToken cancellationToken = default);
        Task<IEnumerable<ChannelOrder>> GetChannelOrdersAsync(int channelId, CancellationToken cancellationToken = default);
        Task<ChannelProduct?> GetChannelProductAsync(int channelId, int perfumeId, CancellationToken cancellationToken = default);
        Task AddChannelProductAsync(ChannelProduct channelProduct, CancellationToken cancellationToken = default);
        Task AddChannelOrderAsync(ChannelOrder channelOrder, CancellationToken cancellationToken = default);
        void UpdateChannelProduct(ChannelProduct channelProduct);
    }
}
