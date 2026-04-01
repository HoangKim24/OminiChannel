using FluentValidation;
using Omnichannel.Controllers;

namespace Omnichannel.Validators
{
    public class ChannelOrderRequestValidator : AbstractValidator<ChannelOrderRequest>
    {
        public ChannelOrderRequestValidator()
        {
            RuleFor(x => x.UserId)
                .GreaterThan(0).WithMessage("UserId phải lớn hơn 0");

            RuleFor(x => x.PerfumeId)
                .GreaterThan(0).WithMessage("PerfumeId phải lớn hơn 0");

            RuleFor(x => x.Quantity)
                .InclusiveBetween(1, 100).WithMessage("Số lượng phải từ 1 đến 100");

            RuleFor(x => x.ExternalOrderId)
                .NotEmpty().WithMessage("ExternalOrderId là bắt buộc")
                .MaximumLength(100).WithMessage("ExternalOrderId tối đa 100 ký tự");

            RuleFor(x => x.ShippingAddress)
                .NotEmpty().WithMessage("Địa chỉ giao hàng là bắt buộc");

            RuleFor(x => x.ReceiverPhone)
                .NotEmpty().WithMessage("Số điện thoại người nhận là bắt buộc");
        }
    }
}
