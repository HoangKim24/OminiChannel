using Omnichannel.Models;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Omnichannel.Repositories
{
    public interface IChannelProductRepository : IRepository<ChannelProduct>
    {
        Task<IEnumerable<ChannelProduct>> GetByChannelIdAsync(int channelId, CancellationToken cancellationToken = default);
        Task<ChannelProduct?> GetByChannelAndPerfumeAsync(int channelId, int perfumeId, CancellationToken cancellationToken = default);
    }
}
