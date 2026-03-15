using Microsoft.EntityFrameworkCore;
using Omnichannel.Models;
using System.Threading.Tasks;

namespace Omnichannel.Repositories
{
    public class SqlUserRepository : IUserRepository
    {
        private readonly Infrastructure.OmnichannelDbContext _context;

        public SqlUserRepository(Infrastructure.OmnichannelDbContext context)
        {
            _context = context;
        }

        public async Task<System.Collections.Generic.IEnumerable<User>> GetAllAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task AddAsync(User entity)
        {
            await _context.Users.AddAsync(entity);
        }

        public void Update(User entity)
        {
            _context.Users.Update(entity);
        }

        public void Delete(User entity)
        {
            _context.Users.Remove(entity);
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        }
    }
}
