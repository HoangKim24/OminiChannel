using Microsoft.EntityFrameworkCore;
using Omnichannel.Models;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Omnichannel.Repositories
{
    public class SqlVoucherRepository : IVoucherRepository
    {
        private readonly Infrastructure.OmnichannelDbContext _context;

        public SqlVoucherRepository(Infrastructure.OmnichannelDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Voucher>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Vouchers.AsNoTracking().ToListAsync(cancellationToken);
        }

        public async Task<PaginatedResult<Voucher>> GetPaginatedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
        {
            var query = _context.Vouchers.AsNoTracking();
            var totalCount = await query.CountAsync(cancellationToken);
            var data = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

            return new PaginatedResult<Voucher> { Data = data, TotalCount = totalCount, Page = page, PageSize = pageSize };
        }

        public async Task<Voucher?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Vouchers.FindAsync(new object[] { id }, cancellationToken);
        }

        public async Task<Voucher?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
        {
            return await _context.Vouchers.FirstOrDefaultAsync(v => v.Code == code, cancellationToken);
        }

        public async Task AddAsync(Voucher entity, CancellationToken cancellationToken = default)
        {
            await _context.Vouchers.AddAsync(entity, cancellationToken);
        }

        public void Update(Voucher entity)
        {
            _context.Vouchers.Update(entity);
        }

        public void Delete(Voucher entity)
        {
            _context.Vouchers.Remove(entity);
        }
    }
}
