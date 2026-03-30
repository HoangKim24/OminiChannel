using Omnichannel.Models;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Omnichannel.Repositories
{
    public interface IPerfumeRepository : IRepository<Perfume>
    {
        Task<IEnumerable<Perfume>> GetByCategoryAsync(string category, CancellationToken cancellationToken = default);
    }
}
