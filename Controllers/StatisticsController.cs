using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using Omnichannel.Services;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Omnichannel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatisticsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly OmnichannelDbContext _dbContext;
        private readonly IHostEnvironment _hostEnvironment;

        public StatisticsController(IUnitOfWork unitOfWork, OmnichannelDbContext dbContext, IHostEnvironment hostEnvironment)
        {
            _unitOfWork = unitOfWork;
            _dbContext = dbContext;
            _hostEnvironment = hostEnvironment;
        }

        private string GetSafeErrorDetail(Exception ex)
        {
            return _hostEnvironment.IsDevelopment()
                ? ex.Message
                : "Đã xảy ra lỗi, vui lòng thử lại sau";
        }

        [HttpGet("sales")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetSalesStats()
        {
            var report = await new SalesReportGenerator(_unitOfWork).GenerateReportAsync();
            return Ok(report);
        }

        [HttpGet("stock")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetStockStats()
        {
            var report = await new StockReportGenerator(_unitOfWork).GenerateReportAsync();
            return Ok(report);
        }

        [HttpGet("inventory")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetInventoryOverview(CancellationToken cancellationToken)
        {
            var perfumes = await _dbContext.Perfumes
                .AsNoTracking()
                .OrderBy(p => p.Name)
                .Select(p => new InventoryProductSummary
                {
                    Id = p.Id,
                    Name = p.Name ?? string.Empty,
                    Brand = p.Brand ?? string.Empty,
                    Gender = p.Gender ?? string.Empty,
                    Concentration = p.Concentration ?? string.Empty,
                    Price = p.Price,
                    StockQuantity = p.StockQuantity,
                    IsLowStock = p.StockQuantity < 10
                })
                .ToListAsync(cancellationToken);

            Dictionary<int, (int total, int active, DateTime? lastSync)> channelProductLookup = await _dbContext.ChannelProducts
                .AsNoTracking()
                .GroupBy(cp => cp.SalesChannelId)
                .Select(group => new
                {
                    SalesChannelId = group.Key,
                    TotalListings = group.Count(),
                    ActiveListings = group.Count(cp => cp.IsListed),
                    LastSyncedAt = group.Max(cp => (DateTime?)cp.LastSyncedAt)
                })
                .ToDictionaryAsync(
                    x => x.SalesChannelId,
                    x => (total: x.TotalListings, active: x.ActiveListings, lastSync: x.LastSyncedAt),
                    cancellationToken);

            var channels = (await _dbContext.SalesChannels
                .AsNoTracking()
                .ToListAsync(cancellationToken))
                .Select(channel =>
                {
                    var stats = channelProductLookup.TryGetValue(channel.Id, out var lookup)
                        ? lookup
                        : (total: 0, active: 0, lastSync: (DateTime?)null);

                    return new InventoryChannelSummary
                    {
                        SalesChannelId = channel.Id,
                        ChannelName = channel.ChannelName,
                        TotalListings = stats.total,
                        ActiveListings = stats.active,
                        LastSyncedAt = stats.lastSync
                    };
                })
                .OrderBy(channel => channel.ChannelName)
                .ToList();

            var response = new InventoryOverviewResponse
            {
                TotalStock = perfumes.Sum(p => p.StockQuantity),
                TotalValue = perfumes.Sum(p => p.Price * p.StockQuantity),
                LowStockCount = perfumes.Count(p => p.IsLowStock),
                ActiveChannels = channels.Count(channel => channel.ActiveListings > 0),
                TotalListings = await _dbContext.ChannelProducts.CountAsync(cancellationToken),
                Products = perfumes,
                Channels = channels
            };

            return Ok(response);
        }

        [HttpGet("dashboard")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetDashboardStats(CancellationToken cancellationToken)
        {
            try
            {
                var totalRevenue = await _dbContext.Orders.SumAsync(o => (decimal?)o.TotalAmount, cancellationToken) ?? 0;
                var totalOrders = await _dbContext.Orders.CountAsync(cancellationToken);
                var totalProducts = await _dbContext.Perfumes.CountAsync(cancellationToken);
                var totalCustomers = await _dbContext.Users.CountAsync(u => u.Role != null && u.Role.Trim().ToLower() == "user", cancellationToken);

                var recentOrdersQuery = await _dbContext.Orders
                    .OrderByDescending(o => o.OrderDate)
                    .Take(5)
                    .Select(o => new OrderSummary
                    {
                        Id = o.Id,
                        UserId = o.UserId,
                        Status = o.Status,
                        TotalAmount = o.TotalAmount,
                        OrderDate = o.OrderDate,
                        ItemCount = 0
                    })
                    .ToListAsync(cancellationToken);

                var recentOrderIds = recentOrdersQuery.Select(o => o.Id).ToList();
                var itemCounts = await _dbContext.OrderItems
                    .Where(item => recentOrderIds.Contains(item.OrderId))
                    .GroupBy(item => item.OrderId)
                    .Select(group => new { OrderId = group.Key, Count = group.Count() })
                    .ToDictionaryAsync(x => x.OrderId, x => x.Count, cancellationToken);

                foreach (var order in recentOrdersQuery)
                {
                    if (itemCounts.TryGetValue(order.Id, out var count))
                    {
                        order.ItemCount = count;
                    }
                }

                var userIds = recentOrdersQuery.Select(o => o.UserId).Distinct().ToList();
                var usersMap = await _dbContext.Users
                    .Where(u => userIds.Contains(u.Id))
                    .ToDictionaryAsync(u => u.Id, u => string.IsNullOrEmpty(u.FullName) ? u.Username : u.FullName, cancellationToken);

                foreach (var o in recentOrdersQuery)
                {
                    o.CustomerName = usersMap.ContainsKey(o.UserId) ? usersMap[o.UserId] : "Khách hàng";
                }

                var lowStockProducts = await _dbContext.Perfumes
                    .Where(p => p.StockQuantity < 10)
                    .OrderBy(p => p.StockQuantity)
                    .Select(p => new LowStockItem
                    {
                        Id = p.Id,
                        Name = p.Name,
                        StockQuantity = p.StockQuantity
                    })
                    .ToListAsync(cancellationToken);

                var stats = new DashboardStatsResponse
                {
                    TotalRevenue = totalRevenue,
                    TotalOrders = totalOrders,
                    TotalProducts = totalProducts,
                    TotalCustomers = totalCustomers,
                    RecentOrders = recentOrdersQuery,
                    LowStockProducts = lowStockProducts
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi tải dashboard", error = GetSafeErrorDetail(ex) });
            }
        }

        [HttpGet("customers")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetCustomerStats(CancellationToken cancellationToken)
        {
            try
            {
                Dictionary<int, (decimal totalSpend, int orderCount, DateTime? lastOrderDate)> orderLookup = await _dbContext.Orders
                    .AsNoTracking()
                    .GroupBy(o => o.UserId)
                    .Select(group => new
                    {
                        UserId = group.Key,
                        TotalSpend = group.Sum(o => o.TotalAmount),
                        OrderCount = group.Count(),
                        LastOrderDate = group.Max(o => (DateTime?)o.OrderDate)
                    })
                    .ToDictionaryAsync(
                        x => x.UserId,
                        x => (totalSpend: x.TotalSpend, orderCount: x.OrderCount, lastOrderDate: x.LastOrderDate),
                        cancellationToken);

                var customers = (await _dbContext.Users
                    .AsNoTracking()
                    .Where(u => u.Role != null && u.Role.Trim().ToLower() == "user")
                    .ToListAsync(cancellationToken))
                    .Select(u =>
                    {
                        var orderStats = orderLookup.TryGetValue(u.Id, out var lookup)
                            ? lookup
                            : (totalSpend: 0m, orderCount: 0, lastOrderDate: (DateTime?)null);

                        return new CustomerSummary
                        {
                            Id = u.Id,
                            Username = u.Username,
                            FullName = u.FullName,
                            Email = u.Email,
                            PhoneNumber = u.PhoneNumber,
                            TotalSpend = orderStats.totalSpend,
                            OrderCount = orderStats.orderCount,
                            LastOrderDate = orderStats.lastOrderDate
                        };
                    })
                    .OrderByDescending(c => c.TotalSpend)
                    .ToList();

                return Ok(customers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi tải thống kê khách hàng", error = GetSafeErrorDetail(ex) });
            }
        }
    }
}
