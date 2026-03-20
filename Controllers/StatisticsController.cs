using Microsoft.AspNetCore.Mvc;
using Omnichannel.Services;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Omnichannel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatisticsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public StatisticsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
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
        public async Task<IActionResult> GetDashboardStats([FromHeader(Name = "X-User-Role")] string role)
        {
            if (role != "Admin") return Unauthorized(new { message = "Chỉ Admin mới có quyền xem dashboard" });

            try
            {
                var orders = (await _unitOfWork.Orders.GetAllAsync()).ToList();
                var products = (await _unitOfWork.Perfumes.GetAllAsync()).ToList();
                var users = (await _unitOfWork.Users.GetAllAsync()).ToList();

                var stats = new DashboardStatsResponse
                {
                    TotalRevenue = orders.Sum(o => o.TotalAmount),
                    TotalOrders = orders.Count,
                    TotalProducts = products.Count,
                    TotalCustomers = users.Count(u => u.Role == "User"),
                    RecentOrders = orders
                        .OrderByDescending(o => o.OrderDate)
                        .Take(5)
                        .Select(o => new OrderSummary
                        {
                            Id = o.Id,
                            UserId = o.UserId,
                            CustomerName = users.FirstOrDefault(u => u.Id == o.UserId)?.FullName
                                ?? users.FirstOrDefault(u => u.Id == o.UserId)?.Username
                                ?? "Khách hàng",
                            Status = o.Status,
                            TotalAmount = o.TotalAmount,
                            OrderDate = o.OrderDate,
                            ItemCount = o.Items?.Count ?? 0
                        }).ToList(),
                    LowStockProducts = products
                        .Where(p => p.StockQuantity < 10)
                        .OrderBy(p => p.StockQuantity)
                        .Select(p => new LowStockItem
                        {
                            Id = p.Id,
                            Name = p.Name,
                            StockQuantity = p.StockQuantity
                        }).ToList()
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi tải dashboard", error = ex.Message });
            }
        }

        [HttpGet("customers")]
        public async Task<IActionResult> GetCustomerStats([FromHeader(Name = "X-User-Role")] string role)
        {
            if (role != "Admin") return Unauthorized(new { message = "Chỉ Admin mới có quyền xem thống kê khách hàng" });

            try
            {
                var users = (await _unitOfWork.Users.GetAllAsync()).ToList();
                var orders = (await _unitOfWork.Orders.GetAllAsync()).ToList();

                var customers = users
                    .Where(u => u.Role == "User")
                    .Select(u =>
                    {
                        var userOrders = orders.Where(o => o.UserId == u.Id).ToList();
                        return new CustomerSummary
                        {
                            Id = u.Id,
                            Username = u.Username,
                            FullName = u.FullName,
                            Email = u.Email,
                            PhoneNumber = u.PhoneNumber,
                            TotalSpend = userOrders.Sum(o => o.TotalAmount),
                            OrderCount = userOrders.Count,
                            LastOrderDate = userOrders.OrderByDescending(o => o.OrderDate).FirstOrDefault()?.OrderDate
                        };
                    })
                    .OrderByDescending(c => c.TotalSpend)
                    .ToList();

                return Ok(customers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi tải thống kê khách hàng", error = ex.Message });
            }
        }
    }
}
