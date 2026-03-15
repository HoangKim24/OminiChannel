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
        ICommentRepository Comments { get; }
        Task<int> CompleteAsync();
    }
}
