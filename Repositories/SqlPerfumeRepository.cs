using Microsoft.EntityFrameworkCore;
using Omnichannel.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Omnichannel.Repositories
{
    public class SqlPerfumeRepository : IPerfumeRepository
    {
        private readonly Infrastructure.OmnichannelDbContext _context;

        public SqlPerfumeRepository(Infrastructure.OmnichannelDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Perfume>> GetAllAsync()
        {
            return await _context.Perfumes.Include(p => p.Category).ToListAsync();
        }

        public async Task<Perfume?> GetByIdAsync(int id)
        {
            return await _context.Perfumes.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task AddAsync(Perfume entity)
        {
            await _context.Perfumes.AddAsync(entity);
        }

        public void Update(Perfume entity)
        {
            _context.Perfumes.Update(entity);
        }

        public void Delete(Perfume entity)
        {
            _context.Perfumes.Remove(entity);
        }

        public async Task<IEnumerable<Perfume>> GetByCategoryAsync(string categoryName)
        {
            return await _context.Perfumes
                .Include(p => p.Category)
                .Where(p => p.Category != null && p.Category.CategoryName == categoryName)
                .ToListAsync();
        }
    }
}
