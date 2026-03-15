using Microsoft.AspNetCore.Mvc;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using System;
using System.Collections.Generic;
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
            if (role != "Admin") return Unauthorized();
            var orders = await _unitOfWork.Orders.GetAllAsync();
            return Ok(orders);
        }

        [HttpPost]
        public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderRequest request)
        {
            var perfume = await _unitOfWork.Perfumes.GetByIdAsync(request.PerfumeId);
            if (perfume == null)
            {
                return NotFound(new { message = "Sản phẩm không tồn tại" });
            }

            var paymentAndStockOk = await _orderFacade.PlaceOrderAsync(request.PerfumeId, request.Quantity);
            if (!paymentAndStockOk)
            {
                return BadRequest(new { message = "Thanh toán thất bại hoặc tồn kho không đủ" });
            }

            var total = perfume.Price * request.Quantity;

            var order = new Order
            {
                UserId = request.UserId,
                OrderDate = DateTime.Now,
                Status = "Completed",
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

            return Ok(new { message = "Đặt hàng thành công", orderId = order.Id });
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(
            int id,
            [FromHeader(Name = "X-User-Role")] string role,
            [FromBody] UpdateOrderStatusRequest request)
        {
            if (role != "Admin") return Unauthorized();

            var existing = await _unitOfWork.Orders.GetByIdAsync(id);
            if (existing == null) return NotFound();

            existing.Status = request.Status;
            _unitOfWork.Orders.Update(existing);
            await _unitOfWork.CompleteAsync();

            return NoContent();
        }
    }
}
