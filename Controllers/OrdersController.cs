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
        private readonly IUnitOfWork _unitOfWork;
        private readonly OrderFacade _orderFacade;

        public OrdersController(IUnitOfWork unitOfWork, OrderFacade orderFacade)
        {
            _unitOfWork = unitOfWork;
            _orderFacade = orderFacade;
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
            if (role != "Admin") return Unauthorized(new { message = "Chỉ Admin mới có quyền xem tất cả đơn hàng" });
            var orders = await _unitOfWork.Orders.GetAllAsync();
            return Ok(orders);
        }

        // Legacy single-item endpoint (kept for backward compatibility)
        [HttpPost]
        public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Dữ liệu không hợp lệ", errors = ModelState });

            var perfume = await _unitOfWork.Perfumes.GetByIdAsync(request.PerfumeId);
            if (perfume == null)
                return NotFound(new { message = "Sản phẩm không tồn tại" });

            if (perfume.StockQuantity < request.Quantity)
                return BadRequest(new { message = $"Tồn kho không đủ. Còn {perfume.StockQuantity} sản phẩm." });

            var paymentAndStockOk = await _orderFacade.PlaceOrderAsync(request.PerfumeId, request.Quantity);
            if (!paymentAndStockOk)
                return BadRequest(new { message = "Thanh toán thất bại hoặc tồn kho không đủ" });

            var total = perfume.Price * request.Quantity;

            var order = new Order
            {
                UserId = request.UserId,
                OrderDate = DateTime.Now,
                Status = "Pending",
                TotalAmount = total,
                ShippingAddress = request.ShippingAddress,
                ReceiverPhone = request.ReceiverPhone,
                Note = request.Note,
                Items = new List<OrderItem>
                {
                    new OrderItem
                    {
                        PerfumeId = perfume.Id,
                        PerfumeName = perfume.Name,
                        Quantity = request.Quantity,
                        Price = perfume.Price
                    }
                }
            };

            await _unitOfWork.Orders.AddAsync(order);
            await _unitOfWork.CompleteAsync();

            return Created("", new { message = "Đặt hàng thành công", orderId = order.Id });
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
            if (role != "Admin") return Unauthorized(new { message = "Chỉ Admin mới có quyền cập nhật trạng thái" });

            if (!ModelState.IsValid)
                return BadRequest(new { message = "Dữ liệu không hợp lệ" });

            var existing = await _unitOfWork.Orders.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = $"Đơn hàng #{id} không tồn tại" });

            var validStatuses = new[] { "Pending", "Confirmed", "Shipping", "Completed", "Cancelled" };
            if (!validStatuses.Contains(request.Status))
                return BadRequest(new { message = $"Trạng thái '{request.Status}' không hợp lệ. Cho phép: {string.Join(", ", validStatuses)}" });

            existing.Status = request.Status;
            _unitOfWork.Orders.Update(existing);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = $"Đã cập nhật trạng thái đơn #{id} thành '{request.Status}'" });
        }
    }
}
