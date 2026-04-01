using Omnichannel.Models;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Omnichannel.Repositories
{
    public interface IChannelOrderRepository : IRepository<ChannelOrder>
    {
        Task<IEnumerable<ChannelOrder>> GetByChannelIdAsync(int channelId, CancellationToken cancellationToken = default);
        Task<ChannelOrder?> GetByExternalOrderIdAsync(string externalOrderId, CancellationToken cancellationToken = default);
    }
}
