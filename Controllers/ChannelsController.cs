using Microsoft.AspNetCore.Mvc;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Omnichannel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChannelsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public ChannelsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // ========== SALES CHANNELS ==========

        [HttpGet]
        public async Task<IActionResult> GetAllChannels()
        {
            var channels = await _unitOfWork.SalesChannels.GetAllAsync();
            return Ok(channels);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetChannel(int id)
        {
            var channel = await _unitOfWork.SalesChannels.GetByIdAsync(id);
            if (channel == null) return NotFound();
            return Ok(channel);
        }

        [HttpPost]
        public async Task<IActionResult> CreateChannel(
            [FromHeader(Name = "X-User-Role")] string role,
            [FromBody] SalesChannel channel)
        {
            if (role != "Admin") return Unauthorized();
            await _unitOfWork.SalesChannels.AddAsync(channel);
            await _unitOfWork.CompleteAsync();
            return CreatedAtAction(nameof(GetChannel), new { id = channel.Id }, channel);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateChannel(
            int id,
            [FromHeader(Name = "X-User-Role")] string role,
            [FromBody] SalesChannel channel)
        {
            if (role != "Admin") return Unauthorized();
            var existing = await _unitOfWork.SalesChannels.GetByIdAsync(id);
            if (existing == null) return NotFound();

            existing.ChannelName = channel.ChannelName;
            existing.IsActive = channel.IsActive;
            existing.ApiKey = channel.ApiKey;
            existing.LogoUrl = channel.LogoUrl;

            _unitOfWork.SalesChannels.Update(existing);
            await _unitOfWork.CompleteAsync();
            return NoContent();
        }

        // ========== CHANNEL PRODUCTS ==========

        [HttpGet("{channelId}/products")]
        public async Task<IActionResult> GetChannelProducts(int channelId)
        {
            var products = await _unitOfWork.SalesChannels.GetChannelProductsAsync(channelId);
            return Ok(products);
        }

        [HttpPost("{channelId}/products")]
        public async Task<IActionResult> ListProductOnChannel(
            int channelId,
            [FromHeader(Name = "X-User-Role")] string role,
            [FromBody] ChannelProductRequest request)
        {
            if (role != "Admin") return Unauthorized();

            var channel = await _unitOfWork.SalesChannels.GetByIdAsync(channelId);
            if (channel == null) return NotFound(new { message = "Kênh bán hàng không tồn tại" });

            var perfume = await _unitOfWork.Perfumes.GetByIdAsync(request.PerfumeId);
            if (perfume == null) return NotFound(new { message = "Sản phẩm không tồn tại" });

            var existing = await _unitOfWork.SalesChannels.GetChannelProductAsync(channelId, request.PerfumeId);
            if (existing != null)
                return BadRequest(new { message = "Sản phẩm đã được đăng trên kênh này" });

            var channelProduct = new ChannelProduct
            {
                SalesChannelId = channelId,
                PerfumeId = request.PerfumeId,
                ChannelPrice = request.ChannelPrice > 0 ? request.ChannelPrice : perfume.Price,
                IsListed = true,
                LastSyncedAt = DateTime.Now
            };

            await _unitOfWork.SalesChannels.AddChannelProductAsync(channelProduct);
            await _unitOfWork.CompleteAsync();
            return Ok(new { message = $"Đã đăng sản phẩm '{perfume.Name}' lên kênh '{channel.ChannelName}'" });
        }

        // ========== CHANNEL ORDERS ==========

        [HttpGet("{channelId}/orders")]
        public async Task<IActionResult> GetChannelOrders(int channelId)
        {
            var orders = await _unitOfWork.SalesChannels.GetChannelOrdersAsync(channelId);
            return Ok(orders);
        }

        [HttpPost("{channelId}/orders")]
        public async Task<IActionResult> ReceiveChannelOrder(
            int channelId,
            [FromBody] ChannelOrderRequest request)
        {
            var channel = await _unitOfWork.SalesChannels.GetByIdAsync(channelId);
            if (channel == null) return NotFound(new { message = "Kênh bán hàng không tồn tại" });

            var perfume = await _unitOfWork.Perfumes.GetByIdAsync(request.PerfumeId);
            if (perfume == null) return NotFound(new { message = "Sản phẩm không tồn tại" });

            if (perfume.StockQuantity < request.Quantity)
                return BadRequest(new { message = "Không đủ hàng trong kho" });

            // Create the main order
            var order = new Order
            {
                UserId = request.UserId,
                OrderDate = DateTime.Now,
                TotalAmount = perfume.Price * request.Quantity,
                Status = "Completed",
                ShippingAddress = request.ShippingAddress,
                ReceiverPhone = request.ReceiverPhone,
                Note = $"Đơn hàng từ {channel.ChannelName} - #{request.ExternalOrderId}",
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

            // Link the order to the sales channel
            var channelOrder = new ChannelOrder
            {
                SalesChannelId = channelId,
                OrderId = order.Id,
                ExternalOrderId = request.ExternalOrderId,
                ChannelStatus = "Received",
                ReceivedAt = DateTime.Now
            };

            await _unitOfWork.SalesChannels.AddChannelOrderAsync(channelOrder);

            // Update stock
            perfume.StockQuantity -= request.Quantity;
            _unitOfWork.Perfumes.Update(perfume);

            await _unitOfWork.CompleteAsync();

            return Ok(new
            {
                message = $"Đã nhận đơn hàng từ {channel.ChannelName}",
                orderId = order.Id,
                externalOrderId = request.ExternalOrderId
            });
        }

        // ========== SYNC ==========

        [HttpPost("{channelId}/sync")]
        public async Task<IActionResult> SyncChannelInventory(
            int channelId,
            [FromHeader(Name = "X-User-Role")] string role)
        {
            if (role != "Admin") return Unauthorized();

            var channel = await _unitOfWork.SalesChannels.GetByIdAsync(channelId);
            if (channel == null) return NotFound();

            var products = await _unitOfWork.SalesChannels.GetChannelProductsAsync(channelId);
            int syncCount = 0;

            foreach (var cp in products)
            {
                if (cp.Perfume != null)
                {
                    cp.LastSyncedAt = DateTime.Now;
                    _unitOfWork.SalesChannels.UpdateChannelProduct(cp);
                    syncCount++;
                }
            }

            await _unitOfWork.CompleteAsync();
            return Ok(new
            {
                message = $"Đã đồng bộ {syncCount} sản phẩm lên {channel.ChannelName}",
                syncedAt = DateTime.Now
            });
        }
    }

    // ========== REQUEST DTOs ==========

    public class ChannelProductRequest
    {
        public int PerfumeId { get; set; }
        public decimal ChannelPrice { get; set; }
    }

    public class ChannelOrderRequest
    {
        public int UserId { get; set; }
        public int PerfumeId { get; set; }
        public int Quantity { get; set; }
        public string ExternalOrderId { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;
        public string ReceiverPhone { get; set; } = string.Empty;
    }
}
