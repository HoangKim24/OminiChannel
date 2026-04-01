using FluentValidation;
using Omnichannel.Controllers;

namespace Omnichannel.Validators
{
    public class ChannelProductRequestValidator : AbstractValidator<ChannelProductRequest>
    {
        public ChannelProductRequestValidator()
        {
            RuleFor(x => x.PerfumeId)
                .GreaterThan(0).WithMessage("PerfumeId phải lớn hơn 0");

            RuleFor(x => x.ChannelPrice)
                .GreaterThanOrEqualTo(0).WithMessage("Giá bán trên kênh không được âm");
        }
    }
}
