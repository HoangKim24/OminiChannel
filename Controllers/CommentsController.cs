using MediatR;
using Microsoft.AspNetCore.Mvc;
using Omnichannel.Features.Comments.Commands;
using Omnichannel.Features.Comments.Queries;
using Omnichannel.Models;
using System.Threading;
using System.Threading.Tasks;

namespace Omnichannel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly ISender _sender;

        public CommentsController(ISender sender)
        {
            _sender = sender;
        }

        [HttpGet("perfume/{perfumeId}")]
        public async Task<IActionResult> GetComments(int perfumeId, CancellationToken cancellationToken)
        {
            var query = new GetCommentsByPerfumeQuery(perfumeId);
            var response = await _sender.Send(query, cancellationToken);
            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> PostComment([FromBody] CreateCommentRequest request, CancellationToken cancellationToken)
        {
            var command = new CreateCommentCommand(request);
            var response = await _sender.Send(command, cancellationToken);
            return Created("", response);
        }
    }
}
