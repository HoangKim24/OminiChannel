using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Omnichannel.Models;

namespace Omnichannel.Repositories
{
    public interface IRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<PaginatedResult<T>> GetPaginatedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
        Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task AddAsync(T entity, CancellationToken cancellationToken = default);
        void Update(T entity);
        void Delete(T entity);
    }
}
