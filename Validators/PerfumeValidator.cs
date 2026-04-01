using FluentValidation;
using Omnichannel.Models;

namespace Omnichannel.Validators
{
    public class PerfumeValidator : AbstractValidator<Perfume>
    {
        public PerfumeValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Tên sản phẩm là bắt buộc")
                .MaximumLength(150).WithMessage("Tên sản phẩm tối đa 150 ký tự");

            RuleFor(x => x.Brand)
                .NotEmpty().WithMessage("Thương hiệu là bắt buộc")
                .MaximumLength(100).WithMessage("Thương hiệu tối đa 100 ký tự");

            RuleFor(x => x.Price)
                .GreaterThan(0).WithMessage("Giá bán phải lớn hơn 0");

            RuleFor(x => x.StockQuantity)
                .GreaterThanOrEqualTo(0).WithMessage("Tồn kho không được âm");

            RuleFor(x => x.Gender)
                .NotEmpty().WithMessage("Giới tính là bắt buộc");
        }
    }
}
