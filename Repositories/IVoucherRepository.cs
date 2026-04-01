using Omnichannel.Models;
using System.Threading;
using System.Threading.Tasks;

namespace Omnichannel.Repositories
{
    public interface IVoucherRepository : IRepository<Voucher>
    {
        Task<Voucher?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    }
}
