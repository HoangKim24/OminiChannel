using MediatR;
using Omnichannel.Models;
using System.Collections.Generic;

namespace Omnichannel.Features.Comments.Queries
{
    public class GetCommentsByPerfumeQuery : IRequest<List<CommentResponse>>
    {
        public int PerfumeId { get; set; }

        public GetCommentsByPerfumeQuery(int perfumeId)
        {
            PerfumeId = perfumeId;
        }
    }
}
