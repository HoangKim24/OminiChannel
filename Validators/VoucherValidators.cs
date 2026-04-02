using FluentValidation;
using Omnichannel.Models;

namespace Omnichannel.Validators
{
    public class VoucherUpsertRequestValidator : AbstractValidator<VoucherUpsertRequest>
    {
        public VoucherUpsertRequestValidator()
        {
            RuleFor(x => x.Code).NotEmpty().MaximumLength(64);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
            RuleFor(x => x.VoucherType).Must(v => v == VoucherTypes.Order || v == VoucherTypes.Shipping)
                .WithMessage("VoucherType không hợp lệ");
            RuleFor(x => x.DiscountType).Must(v => v == VoucherDiscountTypes.Percentage || v == VoucherDiscountTypes.FixedAmount)
                .WithMessage("DiscountType không hợp lệ");
            RuleFor(x => x.DiscountValue).GreaterThan(0);
            RuleFor(x => x.MaxDiscountAmount).GreaterThan(0).When(x => x.MaxDiscountAmount.HasValue);
            RuleFor(x => x.MinOrderValue).GreaterThanOrEqualTo(0);
            RuleFor(x => x.EndAt).GreaterThan(x => x.StartAt).WithMessage("EndAt phải lớn hơn StartAt");
            RuleFor(x => x.UsageLimitTotal).GreaterThan(0).When(x => x.UsageLimitTotal.HasValue);
            RuleFor(x => x.UsageLimitPerUser).GreaterThan(0).When(x => x.UsageLimitPerUser.HasValue);
        }
    }

    public class VoucherLookupRequestValidator : AbstractValidator<VoucherLookupRequest>
    {
        public VoucherLookupRequestValidator()
        {
            RuleFor(x => x.Code).NotEmpty();
            RuleFor(x => x.ItemsSubtotal).GreaterThanOrEqualTo(0);
            RuleFor(x => x.ShippingFee).GreaterThanOrEqualTo(0);
            RuleFor(x => x.UserId).GreaterThan(0).When(x => x.UserId.HasValue);
        }
    }

    public class VoucherApplyRequestValidator : AbstractValidator<VoucherApplyRequest>
    {
        public VoucherApplyRequestValidator()
        {
            RuleFor(x => x.UserId).GreaterThan(0);
            RuleFor(x => x.ItemsSubtotal).GreaterThanOrEqualTo(0);
            RuleFor(x => x.ShippingFee).GreaterThanOrEqualTo(0);
            RuleFor(x => x)
                .Must(x => !string.IsNullOrWhiteSpace(x.VoucherCode) || !string.IsNullOrWhiteSpace(x.OrderVoucherCode) || !string.IsNullOrWhiteSpace(x.ShippingVoucherCode))
                .WithMessage("Cần ít nhất một mã voucher");
        }
    }
}