using FluentValidation;
using System.Linq;
using Omnichannel.Models;

namespace Omnichannel.Validators
{
    public class PlaceBatchOrderItemValidator : AbstractValidator<PlaceBatchOrderItem>
    {
        public PlaceBatchOrderItemValidator()
        {
            RuleFor(x => x.PerfumeId).GreaterThan(0).WithMessage("PerfumeId không hợp lệ");
            RuleFor(x => x.Quantity).InclusiveBetween(1, 100).WithMessage("Số lượng phải từ 1 đến 100");
        }
    }

    public class PlaceBatchOrderValidator : AbstractValidator<PlaceBatchOrderRequest>
    {
        public PlaceBatchOrderValidator()
        {
            RuleFor(x => x.UserId).GreaterThan(0).WithMessage("UserId là bắt buộc");
            RuleFor(x => x.ShippingAddress).NotEmpty().WithMessage("Địa chỉ giao hàng là bắt buộc");
            RuleFor(x => x.ReceiverPhone).NotEmpty().WithMessage("Số điện thoại là bắt buộc");
            RuleFor(x => x.ShippingFee).GreaterThanOrEqualTo(0).WithMessage("Phí ship không hợp lệ");
            RuleFor(x => x.Items)
                .NotEmpty().WithMessage("Danh sách sản phẩm không được rỗng");
            
            When(x => x.Items != null, () => {
                RuleForEach(x => x.Items).SetValidator(new PlaceBatchOrderItemValidator());
            });
        }
    }
}
