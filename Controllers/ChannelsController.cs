using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using Omnichannel.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Omnichannel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChannelsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly InventorySubject _inventorySubject;

        public ChannelsController(IUnitOfWork unitOfWork, InventorySubject inventorySubject)
        {
            _unitOfWork = unitOfWork;
            _inventorySubject = inventorySubject;
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
            if (channel == null) return NotFound(new { message = $"Kênh ID={id} không tồn tại" });
            return Ok(channel);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateChannel(
            [FromBody] SalesChannel channel)
        {
            await _unitOfWork.SalesChannels.AddAsync(channel);
            await _unitOfWork.CompleteAsync();
            return CreatedAtAction(nameof(GetChannel), new { id = channel.Id }, channel);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateChannel(
            int id,
            [FromBody] SalesChannel channel)
        {
            var existing = await _unitOfWork.SalesChannels.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = $"Kênh ID={id} không tồn tại" });

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

        [HttpGet("products")]
        public async Task<IActionResult> GetAllChannelProducts()
        {
            var products = await _unitOfWork.ChannelProducts.GetAllAsync();
            return Ok(products);
        }

        [HttpPost("{channelId}/products")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ListProductOnChannel(
            int channelId,
            [FromBody] ChannelProductRequest request)
        {
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
                LastSyncedAt = DateTime.UtcNow
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
            try
            {
                var channel = await _unitOfWork.SalesChannels.GetByIdAsync(channelId);
                if (channel == null) return NotFound(new { message = "Kênh bán hàng không tồn tại" });

                var perfume = await _unitOfWork.Perfumes.GetByIdAsync(request.PerfumeId);
                if (perfume == null) return NotFound(new { message = "Sản phẩm không tồn tại" });

                if (perfume.StockQuantity < request.Quantity)
                    return BadRequest(new { message = $"Không đủ hàng trong kho. Còn {perfume.StockQuantity} sản phẩm." });

                // Create the main order
                var order = new Order
                {
                    UserId = request.UserId,
                    OrderDate = DateTime.UtcNow,
                    TotalAmount = perfume.Price * request.Quantity,
                    Status = "Pending",
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
                    ReceivedAt = DateTime.UtcNow
                };

                await _unitOfWork.SalesChannels.AddChannelOrderAsync(channelOrder);

                // Update stock
                perfume.StockQuantity -= request.Quantity;
                _unitOfWork.Perfumes.Update(perfume);

                await _inventorySubject.NotifyAsync(perfume);

                await _unitOfWork.CompleteAsync();

                return Ok(new
                {
                    message = $"Đã nhận đơn hàng từ {channel.ChannelName}",
                    orderId = order.Id,
                    externalOrderId = request.ExternalOrderId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi xử lý đơn hàng từ kênh", error = ex.Message });
            }
        }

        // ========== SYNC ==========

        [HttpPost("{channelId}/sync")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SyncChannelInventory(
            int channelId)
        {
            try
            {
                var channel = await _unitOfWork.SalesChannels.GetByIdAsync(channelId);
                if (channel == null) return NotFound(new { message = $"Kênh ID={channelId} không tồn tại" });

                var products = await _unitOfWork.SalesChannels.GetChannelProductsAsync(channelId);
                int syncCount = 0;
                var errors = new List<string>();

                foreach (var cp in products)
                {
                    try
                    {
                        if (cp.Perfume != null)
                        {
                            cp.LastSyncedAt = DateTime.UtcNow;
                            _unitOfWork.SalesChannels.UpdateChannelProduct(cp);
                            syncCount++;
                        }
                    }
                    catch (Exception ex)
                    {
                        errors.Add($"Lỗi đồng bộ sản phẩm ID={cp.PerfumeId}: {ex.Message}");
                    }
                }

                await _unitOfWork.CompleteAsync();

                return Ok(new
                {
                    message = $"Đã đồng bộ {syncCount} sản phẩm lên {channel.ChannelName}",
                    syncedAt = DateTime.UtcNow,
                    errors = errors.Count > 0 ? errors : null
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi đồng bộ kênh", error = ex.Message });
            }
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
