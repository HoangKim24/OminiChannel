using FluentValidation;
using Omnichannel.Models;

namespace Omnichannel.Validators
{
    public class CreateCommentValidator : AbstractValidator<CreateCommentRequest>
    {
        public CreateCommentValidator()
        {
            RuleFor(x => x.PerfumeId).GreaterThan(0).WithMessage("PerfumeId là bắt buộc");
            RuleFor(x => x.UserName).NotEmpty().WithMessage("Tên người đánh giá là bắt buộc");
            RuleFor(x => x.Text).NotEmpty().WithMessage("Nội dung đánh giá là bắt buộc");
            RuleFor(x => x.Stars).InclusiveBetween(1, 5).WithMessage("Số sao phải từ 1 đến 5");
        }
    }
}
