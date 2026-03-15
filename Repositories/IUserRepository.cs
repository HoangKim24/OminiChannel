using Omnichannel.Models;
using System.Threading.Tasks;

namespace Omnichannel.Repositories
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByUsernameAsync(string username);
    }
}
