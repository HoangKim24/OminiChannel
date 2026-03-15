using Omnichannel.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Omnichannel.Repositories
{
    public interface ICommentRepository
    {
        Task<IEnumerable<Comment>> GetByPerfumeIdAsync(int perfumeId);
        Task AddAsync(Comment comment);
    }
}
