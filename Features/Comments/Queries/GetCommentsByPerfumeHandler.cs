using MediatR;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Omnichannel.Features.Comments.Queries
{
    public class GetCommentsByPerfumeHandler : IRequestHandler<GetCommentsByPerfumeQuery, List<CommentResponse>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetCommentsByPerfumeHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<List<CommentResponse>> Handle(GetCommentsByPerfumeQuery request, CancellationToken cancellationToken)
        {
            var comments = await _unitOfWork.Comments.GetByPerfumeIdAsync(request.PerfumeId, cancellationToken);
            
            return comments.Select(c => new CommentResponse
            {
                Id = c.Id,
                PerfumeId = c.PerfumeId,
                UserName = c.UserName,
                Stars = c.Stars,
                Text = c.Text,
                CreatedAt = c.CreatedAt,
                IsVerified = c.IsVerified
            }).ToList();
        }
    }
}
