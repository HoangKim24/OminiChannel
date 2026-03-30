using MediatR;
using Omnichannel.Models;

namespace Omnichannel.Features.Comments.Commands
{
    public class CreateCommentCommand : IRequest<CommentResponse>
    {
        public CreateCommentRequest Request { get; set; }

        public CreateCommentCommand(CreateCommentRequest request)
        {
            Request = request;
        }
    }
}
