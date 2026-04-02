using Microsoft.AspNetCore.Mvc;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Omnichannel.Services;
using Microsoft.EntityFrameworkCore;

namespace Omnichannel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private static bool IsAdminRole(string? role) => string.Equals(role?.Trim(), "Admin", StringComparison.OrdinalIgnoreCase);

        private readonly IUnitOfWork _unitOfWork;
        private readonly OrderFacade _orderFacade;
        private readonly OmnichannelDbContext _context;
        private readonly VoucherPricingService _voucherPricingService;

        public OrdersController(IUnitOfWork unitOfWork, OrderFacade orderFacade, OmnichannelDbContext context, VoucherPricingService voucherPricingService)
        {
            _unitOfWork = unitOfWork;
            _orderFacade = orderFacade;
            _context = context;
            _voucherPricingService = voucherPricingService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(id);
            if (order == null) return NotFound(new { message = "Đơn hàng không tồn tại" });
            return Ok(order);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserOrders(int userId)
        {
            var orders = await _unitOfWork.Orders.GetByUserIdAsync(userId);
            return Ok(orders);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllOrders([FromHeader(Name = "X-User-Role")] string role)
        {
            if (!IsAdminRole(role)) return Unauthorized(new { message = "Chỉ Admin mới có quyền xem tất cả đơn hàng" });
            var orders = await _unitOfWork.Orders.GetAllAsync();
            return Ok(orders);
        }

        [HttpPost]
        public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderRequest request, System.Threading.CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Dữ liệu không hợp lệ", errors = ModelState });

            var result = await _orderFacade.PlaceOrderAsync(request, cancellationToken);
            
            if (!result.Success)
                return BadRequest(new { message = "Sản phẩm không tồn tại hoặc tồn kho không đủ" });

            return Created("", new { message = "Đặt hàng thành công", orderId = result.CreatedOrder!.Id, paymentUrl = result.PaymentUrl });
        }

        // New batch endpoint — handles multi-item checkout in 1 transaction
        [HttpPost("batch")]
        public async Task<IActionResult> PlaceBatchOrder([FromBody] PlaceBatchOrderRequest request, System.Threading.CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Dữ liệu không hợp lệ", errors = ModelState });

            if (request.Items == null || request.Items.Count == 0)
                return BadRequest(new { message = "Giỏ hàng trống" });

            await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
            try
            {
                var orderItems = new List<OrderItem>();
                decimal itemsSubtotal = 0;

                foreach (var item in request.Items)
                {
                    var perfume = await _unitOfWork.Perfumes.GetByIdAsync(item.PerfumeId, cancellationToken);
                    if (perfume == null)
                        return NotFound(new { message = $"Sản phẩm ID={item.PerfumeId} không tồn tại" });

                    if (perfume.StockQuantity < item.Quantity)
                        return BadRequest(new { message = $"Sản phẩm '{perfume.Name}' chỉ còn {perfume.StockQuantity} trong kho" });

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

                var paymentLabel = string.Equals(request.PaymentMethod, "BankTransfer", StringComparison.OrdinalIgnoreCase)
                    ? "CHUYEN_KHOAN"
                    : "TIEN_MAT";

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
                    Status = "Pending",
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

                await transaction.CommitAsync(cancellationToken);

                return Created("", new
                {
                    message = "Đặt hàng thành công",
                    orderId = order.Id,
                    totalAmount = order.TotalAmount,
                    breakdown = new
                    {
                        itemsSubtotal,
                        shippingFee,
                        orderVoucherDiscount = quote?.OrderVoucherDiscount ?? 0,
                        shippingVoucherDiscount = quote?.ShippingVoucherDiscount ?? 0,
                        finalTotal = quote?.FinalTotal ?? (itemsSubtotal + shippingFee)
                    }
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

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(
            int id,
            [FromHeader(Name = "X-User-Role")] string role,
            [FromBody] UpdateOrderStatusRequest request)
        {
            if (!IsAdminRole(role)) return Unauthorized(new { message = "Chỉ Admin mới có quyền cập nhật trạng thái" });

            if (!ModelState.IsValid)
                return BadRequest(new { message = "Dữ liệu không hợp lệ" });

            var existing = await _unitOfWork.Orders.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = $"Đơn hàng #{id} không tồn tại" });

            var validStatuses = new[] { "Pending", "Confirmed", "Shipping", "Completed", "Cancelled" };
            if (!validStatuses.Contains(request.Status))
                return BadRequest(new { message = $"Trạng thái '{request.Status}' không hợp lệ. Cho phép: {string.Join(", ", validStatuses)}" });

            if (request.Status == "Cancelled" && existing.Status != "Cancelled")
            {
                // Restore stock for each item if cancelled
                foreach (var item in existing.Items)
                {
                    var perfume = await _unitOfWork.Perfumes.GetByIdAsync(item.PerfumeId);
                    if (perfume != null)
                    {
                        perfume.StockQuantity += item.Quantity;
                        _unitOfWork.Perfumes.Update(perfume);
                    }
                }
            }

            existing.Status = request.Status;
            _unitOfWork.Orders.Update(existing);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = $"Đã cập nhật trạng thái đơn #{id} thành '{request.Status}'" });
        }
    }
}
