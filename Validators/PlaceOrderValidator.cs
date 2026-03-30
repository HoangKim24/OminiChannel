using FluentValidation;
using Omnichannel.Models;

namespace Omnichannel.Validators
{
    public class PlaceOrderValidator : AbstractValidator<PlaceOrderRequest>
    {
        public PlaceOrderValidator()
        {
            RuleFor(x => x.UserId).GreaterThan(0).WithMessage("UserId là bắt buộc");
            RuleFor(x => x.PerfumeId).GreaterThan(0).WithMessage("PerfumeId là bắt buộc");
            RuleFor(x => x.Quantity).InclusiveBetween(1, 100).WithMessage("Số lượng phải từ 1 đến 100");
            RuleFor(x => x.ShippingAddress).NotEmpty().WithMessage("Địa chỉ giao hàng là bắt buộc");
            RuleFor(x => x.ReceiverPhone).NotEmpty().WithMessage("Số điện thoại là bắt buộc");
        }
    }
}
