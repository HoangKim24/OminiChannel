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
        public ICommentRepository Comments { get; private set; }

        public SqlUnitOfWork(OmnichannelDbContext context)
        {
            _context = context;
            Perfumes = new SqlPerfumeRepository(_context);
            Orders = new SqlOrderRepository(_context);
            Users = new SqlUserRepository(_context);
            SalesChannels = new SqlSalesChannelRepository(_context);
            Comments = new SqlCommentRepository(_context);
        }

        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
