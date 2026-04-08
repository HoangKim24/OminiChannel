using Omnichannel.Infrastructure;
using Omnichannel.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Omnichannel.Services
{
    public class BatchOrderResult
    {
        public required Order Order { get; set; }
        public VoucherApplyResponse? VoucherQuote { get; set; }
        public List<VoucherRedemption> VoucherRedemptions { get; set; } = new();
    }

    public class BatchOrderService
    {
        private readonly OmnichannelDbContext _context;
        private readonly IUnitOfWork _unitOfWork;
        private readonly VoucherPricingService _voucherPricingService;

        public BatchOrderService(
            OmnichannelDbContext context,
            IUnitOfWork unitOfWork,
            VoucherPricingService voucherPricingService)
        {
            _context = context;
            _unitOfWork = unitOfWork;
            _voucherPricingService = voucherPricingService;
        }

        public async Task<BatchOrderResult> CreateBatchOrderAsync(PlaceBatchOrderRequest request, CancellationToken ct)
        {
            var orderItems = new List<OrderItem>();
            decimal itemsSubtotal = 0;

            foreach (var item in request.Items)
            {
                var perfume = await _unitOfWork.Perfumes.GetByIdAsync(item.PerfumeId, ct);
                if (perfume == null)
                {
                    throw new KeyNotFoundException($"Sản phẩm ID={item.PerfumeId} không tồn tại");
                }

                if (perfume.StockQuantity < item.Quantity)
                {
                    throw new InvalidOperationException($"Sản phẩm '{perfume.Name}' chỉ còn {perfume.StockQuantity} trong kho");
                }

                orderItems.Add(new OrderItem
                {
                    PerfumeId = perfume.Id,
                    PerfumeName = perfume.Name,
                    Quantity = item.Quantity,
                    Price = perfume.Price
                });

                itemsSubtotal += perfume.Price * item.Quantity;

                perfume.StockQuantity -= item.Quantity;
                _unitOfWork.Perfumes.Update(perfume);
            }

            var shippingFee = request.IsPickup ? 0 : request.ShippingFee;
            var hasVoucherCodes = !string.IsNullOrWhiteSpace(request.VoucherCode)
                || !string.IsNullOrWhiteSpace(request.OrderVoucherCode)
                || !string.IsNullOrWhiteSpace(request.ShippingVoucherCode);

            VoucherApplyResponse? quote = null;
            if (hasVoucherCodes)
            {
                quote = await _voucherPricingService.QuoteAsync(new VoucherApplyRequest
                {
                    UserId = request.UserId,
                    ItemsSubtotal = itemsSubtotal,
                    ShippingFee = shippingFee,
                    VoucherCode = request.VoucherCode,
                    OrderVoucherCode = request.OrderVoucherCode,
                    ShippingVoucherCode = request.ShippingVoucherCode,
                    SalesChannelId = request.SalesChannelId
                }, ct);
            }

            var paymentLabel = string.Equals(request.PaymentMethod, "BankTransfer", StringComparison.OrdinalIgnoreCase)
                ? "CHUYEN_KHOAN"
                : "TIEN_MAT";

            var orderStatus = string.Equals(request.PaymentMethod, "BankTransfer", StringComparison.OrdinalIgnoreCase)
                ? "PendingPayment"
                : "Confirmed";

            var voucherCodes = quote?.AppliedVouchers.Select(v => v.Code).ToList() ?? new List<string>();
            var composedNote = string.IsNullOrWhiteSpace(request.Note)
                ? $"[PAYMENT:{paymentLabel}]"
                : $"{request.Note} [PAYMENT:{paymentLabel}]";

            if (voucherCodes.Count > 0)
            {
                composedNote += $" [VOUCHERS:{string.Join(",", voucherCodes)}]";
            }

            var order = new Order
            {
                UserId = request.UserId,
                OrderDate = DateTime.UtcNow,
                Status = orderStatus,
                TotalAmount = quote?.FinalTotal ?? (itemsSubtotal + shippingFee),
                ShippingAddress = request.ShippingAddress,
                ReceiverPhone = request.ReceiverPhone,
                Note = composedNote,
                IsPickup = request.IsPickup,
                VoucherCode = voucherCodes.Count > 0 ? string.Join(",", voucherCodes) : request.VoucherCode,
                DiscountAmount = (quote?.OrderVoucherDiscount ?? 0) + (quote?.ShippingVoucherDiscount ?? 0),
                Items = orderItems
            };

            await _unitOfWork.Orders.AddAsync(order, ct);
            await _unitOfWork.CompleteAsync(ct);

            var redemptions = new List<VoucherRedemption>();
            if (quote != null)
            {
                redemptions = VoucherPricingService.BuildRedemptions(order.Id, request.UserId, quote);
                if (redemptions.Count > 0)
                {
                    await _context.VoucherRedemptions.AddRangeAsync(redemptions, ct);
                    await _context.SaveChangesAsync(ct);
                }
            }

            return new BatchOrderResult
            {
                Order = order,
                VoucherQuote = quote,
                VoucherRedemptions = redemptions
            };
        }
    }
}
