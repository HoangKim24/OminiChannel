using FluentValidation;
using Omnichannel.Models;

namespace Omnichannel.Validators
{
    public class UpdateOrderStatusValidator : AbstractValidator<UpdateOrderStatusRequest>
    {
        public UpdateOrderStatusValidator()
        {
            RuleFor(x => x.Status)
                .NotEmpty().WithMessage("Trạng thái đơn hàng là bắt buộc")
                .Must(x => new[] { "Pending", "PendingPayment", "Paid", "Confirmed", "Placed", "Shipping", "Completed", "Cancelled", "Payment Failed" }.Contains(x))
                .WithMessage("Trạng thái đơn hàng không hợp lệ");
        }
    }
}
