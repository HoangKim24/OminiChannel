using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using Omnichannel.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Omnichannel.Controllers
{
    [ApiController]
    [Route("api/payment")]
    [Route("api/payments")]
    public class PaymentController : ControllerBase
    {
        private readonly OmnichannelDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IUnitOfWork _unitOfWork;
        private readonly VoucherPricingService _voucherPricingService;

        public PaymentController(
            OmnichannelDbContext context,
            IConfiguration configuration,
            IUnitOfWork unitOfWork,
            VoucherPricingService voucherPricingService)
        {
            _context = context;
            _configuration = configuration;
            _unitOfWork = unitOfWork;
            _voucherPricingService = voucherPricingService;
        }

        [HttpPost("bank-transfer/request")]
        public async Task<IActionResult> CreateBankTransferRequest([FromBody] PlaceBatchOrderRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Dữ liệu không hợp lệ", errors = ModelState });
            }

            if (!string.Equals(request.PaymentMethod, "BankTransfer", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Endpoint này chỉ hỗ trợ paymentMethod = BankTransfer" });
            }

            if (request.Items == null || request.Items.Count == 0)
            {
                return BadRequest(new { message = "Giỏ hàng trống" });
            }

            await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
            try
            {
                var orderItems = new List<OrderItem>();
                decimal itemsSubtotal = 0;

                foreach (var item in request.Items)
                {
                    var perfume = await _unitOfWork.Perfumes.GetByIdAsync(item.PerfumeId, cancellationToken);
                    if (perfume == null)
                    {
                        return NotFound(new { message = $"Sản phẩm ID={item.PerfumeId} không tồn tại" });
                    }

                    if (perfume.StockQuantity < item.Quantity)
                    {
                        return BadRequest(new { message = $"Sản phẩm '{perfume.Name}' chỉ còn {perfume.StockQuantity} trong kho" });
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
                    }, cancellationToken);
                }

                var voucherCodes = quote?.AppliedVouchers.Select(v => v.Code).ToList() ?? new List<string>();
                var composedNote = string.IsNullOrWhiteSpace(request.Note)
                    ? "[PAYMENT:CHUYEN_KHOAN]"
                    : $"{request.Note} [PAYMENT:CHUYEN_KHOAN]";

                if (voucherCodes.Count > 0)
                {
                    composedNote += $" [VOUCHERS:{string.Join(",", voucherCodes)}]";
                }

                var order = new Order
                {
                    UserId = request.UserId,
                    OrderDate = DateTime.UtcNow,
                    Status = "PendingPayment",
                    TotalAmount = quote?.FinalTotal ?? (itemsSubtotal + shippingFee),
                    ShippingAddress = request.ShippingAddress,
                    ReceiverPhone = request.ReceiverPhone,
                    Note = composedNote,
                    IsPickup = request.IsPickup,
                    VoucherCode = voucherCodes.Count > 0 ? string.Join(",", voucherCodes) : request.VoucherCode,
                    DiscountAmount = (quote?.OrderVoucherDiscount ?? 0) + (quote?.ShippingVoucherDiscount ?? 0),
                    Items = orderItems
                };

                await _unitOfWork.Orders.AddAsync(order, cancellationToken);
                await _unitOfWork.CompleteAsync(cancellationToken);

                if (quote != null)
                {
                    var redemptions = VoucherPricingService.BuildRedemptions(order.Id, request.UserId, quote);
                    if (redemptions.Count > 0)
                    {
                        await _context.VoucherRedemptions.AddRangeAsync(redemptions, cancellationToken);
                        await _context.SaveChangesAsync(cancellationToken);
                    }
                }

                var bankName = _configuration["BankTransfer:BankName"] ?? "Techcombank";
                var bankBin = _configuration["BankTransfer:BankBin"] ?? "970407";
                var accountNo = _configuration["BankTransfer:AccountNo"] ?? "19071687454011";
                var accountName = _configuration["BankTransfer:AccountName"] ?? "NGUYEN LUU HOANG KIM";
                var paymentCode = $"BT-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}";
                var addInfo = Uri.EscapeDataString($"Thanh toan {paymentCode}");
                var accountNameEncoded = Uri.EscapeDataString(accountName);
                var qrUrl = $"https://img.vietqr.io/image/{bankBin}-{accountNo}-compact2.png?amount={order.TotalAmount:0}&addInfo={addInfo}&accountName={accountNameEncoded}";

                var voucherSnapshot = quote == null ? null : JsonSerializer.Serialize(new
                {
                    quote.AppliedVouchers,
                    quote.ItemsSubtotal,
                    quote.ShippingFee,
                    quote.OrderVoucherDiscount,
                    quote.ShippingVoucherDiscount,
                    quote.FinalTotal
                });

                var payment = new BankTransferPayment
                {
                    OrderId = order.Id,
                    PaymentCode = paymentCode,
                    Amount = order.TotalAmount,
                    PaidAmount = 0,
                    BankName = bankName,
                    AccountNo = accountNo,
                    AccountName = accountName,
                    QrUrl = qrUrl,
                    Status = "PendingPayment",
                    AppliedVoucherSnapshotJson = voucherSnapshot,
                    CreatedAt = DateTime.UtcNow
                };

                await _context.BankTransferPayments.AddAsync(payment, cancellationToken);
                await _context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                return Ok(new CreateBankTransferPaymentResponse
                {
                    OrderId = order.Id,
                    PaymentCode = payment.PaymentCode,
                    Amount = payment.Amount,
                    BankName = payment.BankName,
                    AccountNo = payment.AccountNo,
                    AccountName = payment.AccountName,
                    QrUrl = payment.QrUrl,
                    Status = payment.Status
                });
            }
            catch (InvalidOperationException ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                return BadRequest(new { message = ex.Message });
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }

        [HttpGet("bank-transfer/status/{paymentCode}")]
        public async Task<IActionResult> GetBankTransferStatus(string paymentCode, CancellationToken cancellationToken)
        {
            var payment = await _context.BankTransferPayments
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.PaymentCode == paymentCode, cancellationToken);

            if (payment == null)
            {
                return NotFound(new { message = "Không tìm thấy mã thanh toán" });
            }

            var order = await _context.Orders
                .AsNoTracking()
                .FirstOrDefaultAsync(o => o.Id == payment.OrderId, cancellationToken);

            if (order == null)
            {
                return NotFound(new { message = "Đơn hàng không tồn tại" });
            }

            return Ok(new BankTransferPaymentStatusResponse
            {
                OrderId = payment.OrderId,
                PaymentCode = payment.PaymentCode,
                Amount = payment.Amount,
                PaidAmount = payment.PaidAmount,
                IsPaid = string.Equals(payment.Status, "Paid", StringComparison.OrdinalIgnoreCase),
                PaymentStatus = payment.Status,
                OrderStatus = order.Status,
                Message = string.Equals(payment.Status, "Paid", StringComparison.OrdinalIgnoreCase)
                    ? "Đã ghi nhận thanh toán"
                    : "Đang chờ xác nhận thanh toán"
            });
        }

        [HttpPost("bank-transfer/verify")]
        public async Task<IActionResult> VerifyBankTransfer([FromBody] BankTransferVerificationRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Dữ liệu xác minh không hợp lệ", errors = ModelState });
            }

            var payment = await _context.BankTransferPayments
                .FirstOrDefaultAsync(p => p.PaymentCode == request.PaymentCode, cancellationToken);

            if (payment == null)
            {
                return NotFound(new { message = "Không tìm thấy mã thanh toán" });
            }

            if (string.Equals(payment.Status, "Paid", StringComparison.OrdinalIgnoreCase))
            {
                return Ok(new { message = "Thanh toán đã được xác minh trước đó", orderId = payment.OrderId, status = payment.Status });
            }

            var destinationAccount = request.DestinationAccountNo.Trim();
            if (!string.Equals(destinationAccount, payment.AccountNo, StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Sai tài khoản nhận tiền" });
            }

            if (request.PaidAmount != payment.Amount)
            {
                return BadRequest(new { message = "Số tiền chuyển khoản không khớp" });
            }

            if (string.IsNullOrWhiteSpace(request.TransferContent)
                || request.TransferContent.IndexOf(payment.PaymentCode, StringComparison.OrdinalIgnoreCase) < 0)
            {
                return BadRequest(new { message = "Nội dung chuyển khoản không chứa mã thanh toán" });
            }

            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == payment.OrderId, cancellationToken);
            if (order == null)
            {
                return NotFound(new { message = "Đơn hàng không tồn tại" });
            }

            payment.PaidAmount = request.PaidAmount;
            payment.TransferContent = request.TransferContent.Trim();
            payment.ExternalTransactionId = request.ExternalTransactionId?.Trim();
            payment.PaidAt = DateTime.UtcNow;
            payment.Status = "Paid";

            order.Status = "Paid";

            await _context.SaveChangesAsync(cancellationToken);

            return Ok(new
            {
                message = "Xác minh thanh toán thành công",
                orderId = order.Id,
                paymentCode = payment.PaymentCode,
                paymentStatus = payment.Status,
                orderStatus = order.Status
            });
        }

        [HttpPost("bank-transfer/confirm/{paymentCode}")]
        public async Task<IActionResult> ConfirmPaidOrder(string paymentCode, CancellationToken cancellationToken)
        {
            var payment = await _context.BankTransferPayments
                .FirstOrDefaultAsync(p => p.PaymentCode == paymentCode, cancellationToken);

            if (payment == null)
            {
                return NotFound(new { message = "Không tìm thấy mã thanh toán" });
            }

            if (!string.Equals(payment.Status, "Paid", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Không thể xác nhận đơn khi thanh toán chưa hoàn tất" });
            }

            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == payment.OrderId, cancellationToken);
            if (order == null)
            {
                return NotFound(new { message = "Đơn hàng không tồn tại" });
            }

            if (!string.Equals(order.Status, "Confirmed", StringComparison.OrdinalIgnoreCase)
                && !string.Equals(order.Status, "Placed", StringComparison.OrdinalIgnoreCase))
            {
                order.Status = "Confirmed";
                await _context.SaveChangesAsync(cancellationToken);
            }

            return Ok(new
            {
                message = "Đơn hàng đã được xác nhận sau khi thanh toán",
                orderId = order.Id,
                paymentCode = payment.PaymentCode,
                paymentStatus = payment.Status,
                orderStatus = order.Status
            });
        }

        [HttpPost("create-payment-url/{orderId}")]
        public async Task<IActionResult> CreatePaymentUrl(int orderId, [FromServices] VNPayStrategy vnPayStrategy)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null) return NotFound("Order không tồn tại.");

            var paymentUrl = await vnPayStrategy.ProcessPaymentAsync(order);

            return Ok(new { Url = paymentUrl });
        }

        [HttpGet("vnpay-return")]
        public async Task<IActionResult> VNPayReturn([FromQuery] string vnp_TxnRef, [FromQuery] string vnp_ResponseCode, [FromServices] VNPayStrategy vnPayStrategy)
        {
            if (!vnPayStrategy.VerifyReturnSignature(Request.Query))
            {
                return BadRequest("Sai chữ ký bảo mật VNPay");
            }

            var frontEndBaseUrl = _configuration["Frontend:BaseUrl"] ?? "http://localhost:5173";

            if (int.TryParse(vnp_TxnRef, out int orderId))
            {
                var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == orderId);
                if (order != null)
                {
                    if (vnp_ResponseCode == "00")
                    {
                        order.Status = "Paid";
                        await _context.SaveChangesAsync();
                        return Redirect($"{frontEndBaseUrl}/payment-success");
                    }
                    else
                    {
                        order.Status = "Payment Failed";
                        await _context.SaveChangesAsync();
                        return Redirect($"{frontEndBaseUrl}/payment-failed");
                    }
                }
            }

            return BadRequest("Data sai lệch");
        }
    }
}
