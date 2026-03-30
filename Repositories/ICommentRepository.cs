using Omnichannel.Models;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Omnichannel.Repositories
{
    public interface ICommentRepository
    {
        Task<IEnumerable<Comment>> GetByPerfumeIdAsync(int perfumeId, CancellationToken cancellationToken = default);
        Task AddAsync(Comment comment, CancellationToken cancellationToken = default);
    }
}
