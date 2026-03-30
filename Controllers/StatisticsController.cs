using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

        public StatisticsController(IUnitOfWork unitOfWork, OmnichannelDbContext dbContext)
        {
            _unitOfWork = unitOfWork;
            _dbContext = dbContext;
        }

        [HttpGet("sales")]
        public async Task<IActionResult> GetSalesStats([FromHeader(Name = "X-User-Role")] string role)
        {
            if (role != "Admin") return Unauthorized(new { message = "Chỉ Admin mới có quyền xem thống kê" });
            var report = await new SalesReportGenerator(_unitOfWork).GenerateReportAsync();
            return Ok(report);
        }

        [HttpGet("stock")]
        public async Task<IActionResult> GetStockStats([FromHeader(Name = "X-User-Role")] string role)
        {
            if (role != "Admin") return Unauthorized(new { message = "Chỉ Admin mới có quyền xem thống kê" });
            var report = await new StockReportGenerator(_unitOfWork).GenerateReportAsync();
            return Ok(report);
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats([FromHeader(Name = "X-User-Role")] string role, CancellationToken cancellationToken)
        {
            if (role != "Admin") return Unauthorized(new { message = "Chỉ Admin mới có quyền xem dashboard" });

            try
            {
                var totalRevenue = await _dbContext.Orders.SumAsync(o => o.TotalAmount, cancellationToken);
                var totalOrders = await _dbContext.Orders.CountAsync(cancellationToken);
                var totalProducts = await _dbContext.Perfumes.CountAsync(cancellationToken);
                var totalCustomers = await _dbContext.Users.CountAsync(u => u.Role == "User", cancellationToken);

                var recentOrdersQuery = await _dbContext.Orders
                    .Include(o => o.Items)
                    .OrderByDescending(o => o.OrderDate)
                    .Take(5)
                    .Select(o => new OrderSummary
                    {
                        Id = o.Id,
                        UserId = o.UserId,
                        Status = o.Status,
                        TotalAmount = o.TotalAmount,
                        OrderDate = o.OrderDate,
                        ItemCount = o.Items.Count
                    })
                    .ToListAsync(cancellationToken);

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
                return StatusCode(500, new { message = "Lỗi khi tải dashboard", error = ex.Message });
            }
        }

        [HttpGet("customers")]
        public async Task<IActionResult> GetCustomerStats([FromHeader(Name = "X-User-Role")] string role, CancellationToken cancellationToken)
        {
            if (role != "Admin") return Unauthorized(new { message = "Chỉ Admin mới có quyền xem thống kê khách hàng" });

            try
            {
                var customers = await _dbContext.Users
                    .Where(u => u.Role == "User")
                    .Select(u => new CustomerSummary
                    {
                        Id = u.Id,
                        Username = u.Username,
                        FullName = u.FullName,
                        Email = u.Email,
                        PhoneNumber = u.PhoneNumber,
                        TotalSpend = _dbContext.Orders.Where(o => o.UserId == u.Id).Sum(o => o.TotalAmount),
                        OrderCount = _dbContext.Orders.Count(o => o.UserId == u.Id),
                        LastOrderDate = _dbContext.Orders.Where(o => o.UserId == u.Id).Max(o => (DateTime?)o.OrderDate)
                    })
                    .OrderByDescending(c => c.TotalSpend)
                    .ToListAsync(cancellationToken);

                return Ok(customers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi tải thống kê khách hàng", error = ex.Message });
            }
        }
    }
}
