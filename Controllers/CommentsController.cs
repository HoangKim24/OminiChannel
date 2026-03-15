using Microsoft.AspNetCore.Mvc;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Omnichannel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public CommentsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet("perfume/{perfumeId}")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetComments(int perfumeId)
        {
            var comments = await _unitOfWork.Comments.GetByPerfumeIdAsync(perfumeId);
            return Ok(comments);
        }

        [HttpPost]
        public async Task<ActionResult<Comment>> PostComment([FromBody] Comment comment)
        {
            if (comment == null) return BadRequest();
            
            comment.CreatedAt = System.DateTime.Now;
            await _unitOfWork.Comments.AddAsync(comment);
            await _unitOfWork.CompleteAsync();
            
            return CreatedAtAction(nameof(GetComments), new { perfumeId = comment.PerfumeId }, comment);
        }
    }
}
