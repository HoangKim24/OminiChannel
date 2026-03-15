using Microsoft.EntityFrameworkCore;
using Omnichannel.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Omnichannel.Repositories
{
    public class SqlCommentRepository : ICommentRepository
    {
        private readonly Infrastructure.OmnichannelDbContext _context;

        public SqlCommentRepository(Infrastructure.OmnichannelDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Comment>> GetByPerfumeIdAsync(int perfumeId)
        {
            return await _context.Comments
                .Where(c => c.PerfumeId == perfumeId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task AddAsync(Comment comment)
        {
            await _context.Comments.AddAsync(comment);
        }
    }
}
