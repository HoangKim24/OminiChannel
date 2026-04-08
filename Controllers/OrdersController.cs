using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Omnichannel.Extensions;
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
        private readonly IUnitOfWork _unitOfWork;
        private readonly OrderFacade _orderFacade;
        private readonly OmnichannelDbContext _context;
        private readonly BatchOrderService _batchOrderService;

        public OrdersController(IUnitOfWork unitOfWork, OrderFacade orderFacade, OmnichannelDbContext context, BatchOrderService batchOrderService)
        {
            _unitOfWork = unitOfWork;
            _orderFacade = orderFacade;
            _context = context;
            _batchOrderService = batchOrderService;
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetOrderById(int id)
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(id);
            if (order == null) return NotFound(new { message = "Đơn hàng không tồn tại" });

            var currentUserId = User.GetCurrentUserId();
            if (!User.IsInRole("Admin"))
            {
                if (!currentUserId.HasValue)
                {
                    return Unauthorized(new { message = "Không xác định được người dùng hiện tại" });
                }

                if (order.UserId != currentUserId.Value)
                {
                    return Forbid();
                }
            }

            return Ok(order);
        }

        [HttpGet("user/{userId}")]
        [Authorize]
        public async Task<IActionResult> GetUserOrders(int userId)
        {
            var currentUserId = User.GetCurrentUserId();
            if (!User.IsInRole("Admin"))
            {
                if (!currentUserId.HasValue)
                {
                    return Unauthorized(new { message = "Không xác định được người dùng hiện tại" });
                }

                if (userId != currentUserId.Value)
                {
                    return Forbid();
                }
            }

            var orders = await _unitOfWork.Orders.GetByUserIdAsync(userId);
            return Ok(orders);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize < 1 ? 50 : pageSize;

            var orders = await _unitOfWork.Orders.GetPaginatedAsync(page, pageSize);
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

            if (string.Equals(request.PaymentMethod, "BankTransfer", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Đơn chuyển khoản cần tạo qua endpoint /api/payments/bank-transfer/request" });
            }

            if (request.Items == null || request.Items.Count == 0)
                return BadRequest(new { message = "Giỏ hàng trống" });

            await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
            try
            {
                var batchResult = await _batchOrderService.CreateBatchOrderAsync(request, cancellationToken);
                var order = batchResult.Order;
                var quote = batchResult.VoucherQuote;
                var itemsSubtotal = order.Items.Sum(i => i.Price * i.Quantity);
                var shippingFee = request.IsPickup ? 0 : request.ShippingFee;

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
            catch (KeyNotFoundException ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                return NotFound(new { message = ex.Message });
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync(cancellationToken);
                return Conflict(new { message = "Sản phẩm vừa được cập nhật, vui lòng thử lại" });
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
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateOrderStatus(
            int id,
            [FromBody] UpdateOrderStatusRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Dữ liệu không hợp lệ" });

            var existing = await _unitOfWork.Orders.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = $"Đơn hàng #{id} không tồn tại" });

            var validStatuses = new[] { "Pending", "PendingPayment", "Paid", "Confirmed", "Placed", "Shipping", "Completed", "Cancelled", "Payment Failed" };
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
