using Omnichannel.Repositories;
using System.Threading.Tasks;

namespace Omnichannel.Infrastructure
{
    public class SqlUnitOfWork : IUnitOfWork
    {
        private readonly OmnichannelDbContext _context;

        public IPerfumeRepository Perfumes { get; private set; }
        public IOrderRepository Orders { get; private set; }
        public IUserRepository Users { get; private set; }
        public ISalesChannelRepository SalesChannels { get; private set; }
        public IChannelProductRepository ChannelProducts { get; private set; }
        public IChannelOrderRepository ChannelOrders { get; private set; }
        public ICommentRepository Comments { get; private set; }

        public SqlUnitOfWork(OmnichannelDbContext context)
        {
            _context = context;
            Perfumes = new SqlPerfumeRepository(_context);
            Orders = new SqlOrderRepository(_context);
            Users = new SqlUserRepository(_context);
            SalesChannels = new SqlSalesChannelRepository(_context);
            ChannelProducts = new SqlChannelProductRepository(_context);
            ChannelOrders = new SqlChannelOrderRepository(_context);
            Comments = new SqlCommentRepository(_context);
        }

        public async Task<int> CompleteAsync(System.Threading.CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
