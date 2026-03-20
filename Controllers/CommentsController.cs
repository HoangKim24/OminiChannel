using Microsoft.AspNetCore.Mvc;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using System;
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
        public async Task<IActionResult> GetComments(int perfumeId)
        {
            var comments = await _unitOfWork.Comments.GetByPerfumeIdAsync(perfumeId);
            var response = new List<CommentResponse>();
            foreach (var c in comments)
            {
                response.Add(new CommentResponse
                {
                    Id = c.Id,
                    PerfumeId = c.PerfumeId,
                    UserName = c.UserName,
                    Stars = c.Stars,
                    Text = c.Text,
                    CreatedAt = c.CreatedAt,
                    IsVerified = c.IsVerified
                });
            }
            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> PostComment([FromBody] CreateCommentRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Dữ liệu không hợp lệ", errors = ModelState });

            var perfume = await _unitOfWork.Perfumes.GetByIdAsync(request.PerfumeId);
            if (perfume == null)
                return NotFound(new { message = "Sản phẩm không tồn tại" });

            var comment = new Comment
            {
                PerfumeId = request.PerfumeId,
                UserName = request.UserName,
                Stars = request.Stars,
                Text = request.Text,
                IsVerified = request.IsVerified,
                CreatedAt = DateTime.Now
            };

            await _unitOfWork.Comments.AddAsync(comment);
            await _unitOfWork.CompleteAsync();

            var response = new CommentResponse
            {
                Id = comment.Id,
                PerfumeId = comment.PerfumeId,
                UserName = comment.UserName,
                Stars = comment.Stars,
                Text = comment.Text,
                CreatedAt = comment.CreatedAt,
                IsVerified = comment.IsVerified
            };

            return Created("", response);
        }
    }
}
