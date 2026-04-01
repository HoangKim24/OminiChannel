using Omnichannel.Repositories;
using System;
using System.Threading.Tasks;

namespace Omnichannel.Infrastructure
{
    public interface IUnitOfWork : IDisposable
    {
        IPerfumeRepository Perfumes { get; }
        IOrderRepository Orders { get; }
        IUserRepository Users { get; }
        ISalesChannelRepository SalesChannels { get; }
        ICategoryRepository Categories { get; }
        IChannelProductRepository ChannelProducts { get; }
        IChannelOrderRepository ChannelOrders { get; }
        ICommentRepository Comments { get; }
        IVoucherRepository Vouchers { get; }
        Task<int> CompleteAsync(System.Threading.CancellationToken cancellationToken = default);
    }
}
