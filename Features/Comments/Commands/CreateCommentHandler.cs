using MediatR;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Omnichannel.Features.Comments.Commands
{
    public class CreateCommentHandler : IRequestHandler<CreateCommentCommand, CommentResponse>
    {
        private readonly IUnitOfWork _unitOfWork;

        public CreateCommentHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<CommentResponse> Handle(CreateCommentCommand command, CancellationToken cancellationToken)
        {
            var request = command.Request;

            var comment = new Comment
            {
                PerfumeId = request.PerfumeId,
                UserName = request.UserName,
                Stars = request.Stars,
                Text = request.Text,
                IsVerified = request.IsVerified,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Comments.AddAsync(comment, cancellationToken);
            await _unitOfWork.CompleteAsync(cancellationToken);

            return new CommentResponse
            {
                Id = comment.Id,
                PerfumeId = comment.PerfumeId,
                UserName = comment.UserName,
                Stars = comment.Stars,
                Text = comment.Text,
                CreatedAt = comment.CreatedAt,
                IsVerified = comment.IsVerified
            };
        }
    }
}
