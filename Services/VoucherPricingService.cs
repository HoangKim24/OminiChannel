using Microsoft.EntityFrameworkCore;
using Omnichannel.Infrastructure;
using Omnichannel.Models;

namespace Omnichannel.Services
{
    public class VoucherPricingService
    {
        private readonly OmnichannelDbContext _context;

        public VoucherPricingService(OmnichannelDbContext context)
        {
            _context = context;
        }

        public async Task<VoucherValidationResponse> ValidateAsync(VoucherLookupRequest request, CancellationToken cancellationToken = default)
        {
            var evaluation = await EvaluateAsync(new[] { request.Code }, request.UserId, request.ItemsSubtotal, request.ShippingFee, request.SalesChannelId, cancellationToken);

            return new VoucherValidationResponse
            {
                IsValid = evaluation.Success,
                Message = evaluation.Success ? "Mã hợp lệ" : evaluation.Message,
                DiscountAmount = evaluation.Success ? evaluation.TotalDiscount : 0,
                AppliedVoucher = evaluation.Success ? evaluation.AppliedLines.FirstOrDefault() : null
            };
        }

        public async Task<VoucherApplyResponse> ApplyAsync(VoucherApplyRequest request, CancellationToken cancellationToken = default)
        {
            var codes = CollectCodes(request.VoucherCode, request.OrderVoucherCode, request.ShippingVoucherCode);
            var evaluation = await EvaluateAsync(codes, request.UserId, request.ItemsSubtotal, request.ShippingFee, request.SalesChannelId, cancellationToken);

            if (!evaluation.Success)
            {
                throw new InvalidOperationException(evaluation.Message);
            }

            return new VoucherApplyResponse
            {
                ItemsSubtotal = request.ItemsSubtotal,
                ShippingFee = request.ShippingFee,
                OrderVoucherDiscount = evaluation.OrderVoucherDiscount,
                ShippingVoucherDiscount = evaluation.ShippingVoucherDiscount,
                FinalTotal = evaluation.FinalTotal,
                AppliedVouchers = evaluation.AppliedLines
            };
        }

        public async Task<VoucherApplyResponse> QuoteAsync(VoucherApplyRequest request, CancellationToken cancellationToken = default)
        {
            return await ApplyAsync(request, cancellationToken);
        }

        public static List<VoucherRedemption> BuildRedemptions(int orderId, int userId, VoucherApplyResponse quote)
        {
            return quote.AppliedVouchers.Select(line => new VoucherRedemption
            {
                OrderId = orderId,
                UserId = userId,
                VoucherId = line.VoucherId,
                DiscountAmount = line.DiscountAmount,
                RedeemedAt = DateTime.UtcNow
            }).ToList();
        }

        private static List<string> CollectCodes(params string?[] codes)
        {
            return codes
                .Where(code => !string.IsNullOrWhiteSpace(code))
                .Select(code => NormalizeCode(code!))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();
        }

        private async Task<VoucherEvaluationResult> EvaluateAsync(IReadOnlyCollection<string> codes, int? userId, decimal itemsSubtotal, decimal shippingFee, int? salesChannelId, CancellationToken cancellationToken)
        {
            if (codes.Count == 0)
            {
                return VoucherEvaluationResult.Fail("Cần ít nhất một mã voucher");
            }

            if (codes.Count > 2)
            {
                return VoucherEvaluationResult.Fail("Chỉ có thể áp dụng tối đa 2 voucher: 1 order voucher và 1 shipping voucher");
            }

            if (itemsSubtotal < 0 || shippingFee < 0)
            {
                return VoucherEvaluationResult.Fail("Giá trị đơn hàng hoặc phí ship không hợp lệ");
            }

            var vouchers = await _context.Vouchers
                .AsNoTracking()
                .Where(v => codes.Contains(v.Code))
                .ToListAsync(cancellationToken);

            if (vouchers.Count != codes.Count)
            {
                var missingCode = codes.First(code => vouchers.All(v => !string.Equals(v.Code, code, StringComparison.OrdinalIgnoreCase)));
                return VoucherEvaluationResult.Fail($"Mã voucher '{missingCode}' không tồn tại");
            }

            var orderDiscount = 0m;
            var shippingDiscount = 0m;
            var appliedLines = new List<VoucherAppliedLine>();
            var now = DateTime.UtcNow;
            var hasOrderContext = itemsSubtotal > 0 || shippingFee > 0;

            foreach (var voucher in vouchers)
            {
                var validation = await ValidateVoucherAsync(voucher, userId, itemsSubtotal, shippingFee, salesChannelId, now, hasOrderContext, cancellationToken);
                if (!validation.Success)
                {
                    return validation;
                }

                var baseAmount = string.Equals(voucher.VoucherType, VoucherTypes.Shipping, StringComparison.OrdinalIgnoreCase)
                    ? shippingFee
                    : itemsSubtotal;

                var discountAmount = CalculateDiscount(voucher, baseAmount);
                if (discountAmount <= 0)
                {
                    return VoucherEvaluationResult.Fail($"Mã '{voucher.Code}' không tạo ra chiết khấu hợp lệ cho đơn này");
                }

                var appliedLine = new VoucherAppliedLine
                {
                    VoucherId = voucher.Id,
                    Code = voucher.Code,
                    VoucherType = voucher.VoucherType,
                    DiscountType = voucher.DiscountType,
                    AppliedBaseAmount = baseAmount,
                    DiscountAmount = discountAmount
                };

                if (string.Equals(voucher.VoucherType, VoucherTypes.Shipping, StringComparison.OrdinalIgnoreCase))
                {
                    if (shippingDiscount > 0)
                    {
                        return VoucherEvaluationResult.Fail("Chỉ được áp dụng một shipping voucher cho mỗi đơn hàng");
                    }

                    shippingDiscount = discountAmount;
                }
                else
                {
                    if (orderDiscount > 0)
                    {
                        return VoucherEvaluationResult.Fail("Chỉ được áp dụng một order voucher cho mỗi đơn hàng");
                    }

                    orderDiscount = discountAmount;
                }

                appliedLines.Add(appliedLine);
            }

            var finalTotal = Math.Max(0, itemsSubtotal + shippingFee - orderDiscount - shippingDiscount);

            return VoucherEvaluationResult.SuccessResult(
                itemsSubtotal,
                shippingFee,
                orderDiscount,
                shippingDiscount,
                finalTotal,
                appliedLines);
        }

        private async Task<VoucherEvaluationResult> ValidateVoucherAsync(
            Voucher voucher,
            int? userId,
            decimal itemsSubtotal,
            decimal shippingFee,
            int? salesChannelId,
            DateTime utcNow,
            bool hasOrderContext,
            CancellationToken cancellationToken)
        {
            if (!voucher.IsActive || voucher.IsDeleted)
            {
                return VoucherEvaluationResult.Fail($"Mã '{voucher.Code}' đã bị khóa");
            }

            if (voucher.StartAt > utcNow || voucher.EndAt < utcNow)
            {
                return VoucherEvaluationResult.Fail($"Mã '{voucher.Code}' đã hết hạn hoặc chưa đến thời gian hiệu lực");
            }

            if (voucher.SalesChannelId.HasValue && voucher.SalesChannelId != salesChannelId)
            {
                return VoucherEvaluationResult.Fail($"Mã '{voucher.Code}' chỉ áp dụng cho kênh bán cụ thể");
            }

            if (hasOrderContext && itemsSubtotal < voucher.MinOrderValue)
            {
                return VoucherEvaluationResult.Fail($"Đơn hàng phải tối thiểu {voucher.MinOrderValue:N0}đ để áp dụng mã này");
            }

            var totalRedemptions = await _context.VoucherRedemptions.CountAsync(r => r.VoucherId == voucher.Id, cancellationToken);
            if (voucher.UsageLimitTotal.HasValue && totalRedemptions >= voucher.UsageLimitTotal.Value)
            {
                return VoucherEvaluationResult.Fail($"Mã '{voucher.Code}' đã hết lượt sử dụng");
            }

            if (userId.HasValue && userId.Value > 0)
            {
                var userRedemptions = await _context.VoucherRedemptions.CountAsync(r => r.VoucherId == voucher.Id && r.UserId == userId.Value, cancellationToken);
                if (voucher.UsageLimitPerUser.HasValue && userRedemptions >= voucher.UsageLimitPerUser.Value)
                {
                    return VoucherEvaluationResult.Fail($"Bạn đã đạt giới hạn sử dụng mã '{voucher.Code}'");
                }
            }

            var baseAmount = string.Equals(voucher.VoucherType, VoucherTypes.Shipping, StringComparison.OrdinalIgnoreCase)
                ? shippingFee
                : itemsSubtotal;

            if (hasOrderContext && baseAmount <= 0)
            {
                return VoucherEvaluationResult.Fail($"Mã '{voucher.Code}' không thể áp dụng cho giá trị hiện tại");
            }

            return VoucherEvaluationResult.SuccessResult(
                itemsSubtotal,
                shippingFee,
                0,
                0,
                0,
                new List<VoucherAppliedLine>());
        }

        private static decimal CalculateDiscount(Voucher voucher, decimal baseAmount)
        {
            if (baseAmount <= 0)
            {
                return 0;
            }

            decimal discountAmount = string.Equals(voucher.DiscountType, VoucherDiscountTypes.Percentage, StringComparison.OrdinalIgnoreCase)
                ? baseAmount * (voucher.DiscountValue / 100m)
                : voucher.DiscountValue;

            if (voucher.MaxDiscountAmount.HasValue && voucher.MaxDiscountAmount.Value > 0)
            {
                discountAmount = Math.Min(discountAmount, voucher.MaxDiscountAmount.Value);
            }

            return Math.Min(discountAmount, baseAmount);
        }

        private static string NormalizeCode(string code)
        {
            return code.Trim().ToUpperInvariant();
        }

        private sealed class VoucherEvaluationResult
        {
            private VoucherEvaluationResult(bool success, string message)
            {
                Success = success;
                Message = message;
            }

            public bool Success { get; }
            public string Message { get; }
            public decimal ItemsSubtotal { get; private set; }
            public decimal ShippingFee { get; private set; }
            public decimal OrderVoucherDiscount { get; private set; }
            public decimal ShippingVoucherDiscount { get; private set; }
            public decimal FinalTotal { get; private set; }
            public decimal TotalDiscount => OrderVoucherDiscount + ShippingVoucherDiscount;
            public List<VoucherAppliedLine> AppliedLines { get; private set; } = new();

            public static VoucherEvaluationResult SuccessResult(decimal itemsSubtotal, decimal shippingFee, decimal orderDiscount, decimal shippingDiscount, decimal finalTotal, List<VoucherAppliedLine> appliedLines)
            {
                return new VoucherEvaluationResult(true, string.Empty)
                {
                    ItemsSubtotal = itemsSubtotal,
                    ShippingFee = shippingFee,
                    OrderVoucherDiscount = orderDiscount,
                    ShippingVoucherDiscount = shippingDiscount,
                    FinalTotal = finalTotal,
                    AppliedLines = appliedLines
                };
            }

            public static VoucherEvaluationResult Fail(string message)
            {
                return new VoucherEvaluationResult(false, message);
            }
        }
    }
}