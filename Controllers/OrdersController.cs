using Microsoft.AspNetCore.Mvc;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Omnichannel.Services;

namespace Omnichannel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private static bool IsAdminRole(string? role) => string.Equals(role?.Trim(), "Admin", StringComparison.OrdinalIgnoreCase);

        private readonly IUnitOfWork _unitOfWork;
        private readonly OrderFacade _orderFacade;

        public OrdersController(IUnitOfWork unitOfWork, OrderFacade orderFacade)
        {
            _unitOfWork = unitOfWork;
            _orderFacade = orderFacade;
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
        public async Task<IActionResult> PlaceBatchOrder([FromBody] PlaceBatchOrderRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Dữ liệu không hợp lệ", errors = ModelState });

            if (request.Items == null || request.Items.Count == 0)
                return BadRequest(new { message = "Giỏ hàng trống" });

            // Validate all items first
            var orderItems = new List<OrderItem>();
            decimal totalAmount = 0;

            foreach (var item in request.Items)
            {
                var perfume = await _unitOfWork.Perfumes.GetByIdAsync(item.PerfumeId);
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

                totalAmount += perfume.Price * item.Quantity;

                // Deduct stock
                perfume.StockQuantity -= item.Quantity;
                _unitOfWork.Perfumes.Update(perfume);
            }

            decimal discountAmount = 0;
            if (!string.IsNullOrEmpty(request.VoucherCode))
            {
                var voucher = await _unitOfWork.Vouchers.GetByCodeAsync(request.VoucherCode);
                if (voucher != null && voucher.IsActive && voucher.ExpiryDate > DateTime.Now)
                {
                    if (totalAmount >= voucher.MinOrderValue)
                    {
                        if (voucher.UsageLimit == 0 || voucher.UsedCount < voucher.UsageLimit)
                        {
                            discountAmount = voucher.DiscountAmount;
                            voucher.UsedCount++;
                            _unitOfWork.Vouchers.Update(voucher);
                        }
                    }
                }
            }

            totalAmount = Math.Max(0, totalAmount - discountAmount);

            var order = new Order
            {
                UserId = request.UserId,
                OrderDate = DateTime.Now,
                Status = "Pending",
                TotalAmount = totalAmount,
                ShippingAddress = request.ShippingAddress,
                ReceiverPhone = request.ReceiverPhone,
                Note = request.Note,
                IsPickup = request.IsPickup,
                VoucherCode = request.VoucherCode,
                DiscountAmount = discountAmount,
                Items = orderItems
            };

            await _unitOfWork.Orders.AddAsync(order);
            await _unitOfWork.CompleteAsync();

            return Created("", new { message = "Đặt hàng thành công", orderId = order.Id, totalAmount = order.TotalAmount });
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
