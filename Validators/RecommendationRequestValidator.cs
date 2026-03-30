using FluentValidation;
using Omnichannel.Services;

namespace Omnichannel.Validators
{
    public class RecommendationRequestValidator : AbstractValidator<RecommendationRequest>
    {
        public RecommendationRequestValidator()
        {
            RuleFor(x => x.PreferredNotes)
                .NotNull().WithMessage("Danh sách nốt hương không được rỗng");
        }
    }
}
