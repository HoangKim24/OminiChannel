using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using Omnichannel.Services;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Omnichannel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatisticsController : ControllerBase
    {
        private static readonly string[] RevenueEligibleStatuses = { "paid", "confirmed", "shipping", "completed" };
        private static readonly string[] WeekdayLabels = { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" };

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
                var totalRevenue = await _dbContext.Orders
                    .Where(order => RevenueEligibleStatuses.Contains((order.Status ?? string.Empty).Trim().ToLower()))
                    .SumAsync(o => (decimal?)o.TotalAmount, cancellationToken) ?? 0;
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

        [HttpGet("revenue")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetRevenue(
            [FromQuery] string mode = "month",
            [FromQuery] string? from = null,
            [FromQuery] string? to = null,
            [FromQuery] int? year = null,
            [FromQuery] string? month = null,
            CancellationToken cancellationToken = default)
        {
            var normalizedMode = (mode ?? "month").Trim().ToLowerInvariant();
            var validModes = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "day", "week", "month", "year", "weekday" };

            if (!validModes.Contains(normalizedMode))
            {
                return BadRequest(new { message = "mode không hợp lệ. Hỗ trợ: day|week|month|year|weekday" });
            }

            var revenueQuery = _dbContext.Orders
                .AsNoTracking()
                .Where(order => RevenueEligibleStatuses.Contains((order.Status ?? string.Empty).Trim().ToLower()));

            switch (normalizedMode)
            {
                case "day":
                    return await BuildDaySeriesAsync(revenueQuery, from, to, cancellationToken);
                case "week":
                    return await BuildWeekSeriesAsync(revenueQuery, from, to, cancellationToken);
                case "month":
                    return await BuildMonthSeriesAsync(revenueQuery, month, cancellationToken);
                case "year":
                    return await BuildYearSeriesAsync(revenueQuery, year, cancellationToken);
                case "weekday":
                    return await BuildWeekdaySeriesAsync(revenueQuery, from, to, cancellationToken);
                default:
                    return BadRequest(new { message = "mode không hợp lệ" });
            }
        }

        private static bool TryParseDateOnly(string? raw, out DateOnly value)
        {
            return DateOnly.TryParseExact(raw, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out value);
        }

        private static DateTime AsUtcStart(DateOnly date)
        {
            return DateTime.SpecifyKind(date.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
        }

        private static int ToIsoWeekdayIndex(DateTime utcDate)
        {
            return ((int)utcDate.DayOfWeek + 6) % 7;
        }

        private static string BuildDateLabel(DateOnly date)
        {
            return date.ToString("dd/MM", CultureInfo.InvariantCulture);
        }

        private async Task<IActionResult> BuildDaySeriesAsync(IQueryable<Order> revenueQuery, string? from, string? to, CancellationToken cancellationToken)
        {
            var utcToday = DateTime.UtcNow.Date;
            var defaultFrom = DateOnly.FromDateTime(utcToday.AddDays(-29));
            var defaultTo = DateOnly.FromDateTime(utcToday);

            var hasFrom = TryParseDateOnly(from, out var fromDate);
            var hasTo = TryParseDateOnly(to, out var toDate);

            var rangeFrom = hasFrom ? fromDate : defaultFrom;
            var rangeTo = hasTo ? toDate : defaultTo;

            if (rangeFrom > rangeTo)
            {
                return BadRequest(new { message = "from phải nhỏ hơn hoặc bằng to" });
            }

            var startUtc = AsUtcStart(rangeFrom);
            var endExclusiveUtc = AsUtcStart(rangeTo.AddDays(1));

            var grouped = await revenueQuery
                .Where(order => order.OrderDate >= startUtc && order.OrderDate < endExclusiveUtc)
                .GroupBy(order => order.OrderDate.Date)
                .Select(group => new { Date = group.Key, Total = group.Sum(order => order.TotalAmount) })
                .ToDictionaryAsync(x => DateOnly.FromDateTime(x.Date), x => x.Total, cancellationToken);

            var labels = new List<string>();
            var values = new List<decimal>();
            for (var date = rangeFrom; date <= rangeTo; date = date.AddDays(1))
            {
                labels.Add(BuildDateLabel(date));
                values.Add(grouped.TryGetValue(date, out var amount) ? amount : 0);
            }

            return Ok(new RevenueSeriesResponse
            {
                Mode = "day",
                Timezone = "UTC",
                Labels = labels.ToArray(),
                Values = values.ToArray(),
                Total = values.Sum(),
                From = rangeFrom.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                To = rangeTo.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)
            });
        }

        private async Task<IActionResult> BuildWeekSeriesAsync(IQueryable<Order> revenueQuery, string? from, string? to, CancellationToken cancellationToken)
        {
            var utcToday = DateTime.UtcNow.Date;
            var currentDate = DateOnly.FromDateTime(utcToday);
            var currentIsoWeekday = ToIsoWeekdayIndex(utcToday);
            var defaultFrom = currentDate.AddDays(-currentIsoWeekday);
            var defaultTo = defaultFrom.AddDays(6);

            var hasFrom = TryParseDateOnly(from, out var fromDate);
            var hasTo = TryParseDateOnly(to, out var toDate);

            var rangeFrom = hasFrom ? fromDate : defaultFrom;
            var rangeTo = hasTo ? toDate : defaultTo;

            if (rangeFrom > rangeTo)
            {
                return BadRequest(new { message = "from phải nhỏ hơn hoặc bằng to" });
            }

            if (rangeTo.DayNumber - rangeFrom.DayNumber != 6)
            {
                return BadRequest(new { message = "mode=week yêu cầu khoảng đúng 7 ngày" });
            }

            if (ToIsoWeekdayIndex(AsUtcStart(rangeFrom)) != 0 || ToIsoWeekdayIndex(AsUtcStart(rangeTo)) != 6)
            {
                return BadRequest(new { message = "mode=week yêu cầu từ Thứ 2 đến Chủ nhật (Mon-Sun)" });
            }

            var startUtc = AsUtcStart(rangeFrom);
            var endExclusiveUtc = AsUtcStart(rangeTo.AddDays(1));

            var grouped = await revenueQuery
                .Where(order => order.OrderDate >= startUtc && order.OrderDate < endExclusiveUtc)
                .GroupBy(order => order.OrderDate.Date)
                .Select(group => new { Date = group.Key, Total = group.Sum(order => order.TotalAmount) })
                .ToDictionaryAsync(x => DateOnly.FromDateTime(x.Date), x => x.Total, cancellationToken);

            var labels = new List<string>();
            var values = new List<decimal>();
            for (var dayOffset = 0; dayOffset < 7; dayOffset++)
            {
                var date = rangeFrom.AddDays(dayOffset);
                labels.Add($"{WeekdayLabels[dayOffset]} {BuildDateLabel(date)}");
                values.Add(grouped.TryGetValue(date, out var amount) ? amount : 0);
            }

            return Ok(new RevenueSeriesResponse
            {
                Mode = "week",
                Timezone = "UTC",
                Labels = labels.ToArray(),
                Values = values.ToArray(),
                Total = values.Sum(),
                From = rangeFrom.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                To = rangeTo.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)
            });
        }

        private async Task<IActionResult> BuildMonthSeriesAsync(IQueryable<Order> revenueQuery, string? month, CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;
            var selectedMonthText = string.IsNullOrWhiteSpace(month)
                ? now.ToString("yyyy-MM", CultureInfo.InvariantCulture)
                : month.Trim();

            if (!DateOnly.TryParseExact($"{selectedMonthText}-01", "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var monthStartDate))
            {
                return BadRequest(new { message = "month phải theo định dạng YYYY-MM" });
            }

            var monthEndDate = monthStartDate.AddMonths(1).AddDays(-1);
            var startUtc = AsUtcStart(monthStartDate);
            var endExclusiveUtc = AsUtcStart(monthEndDate.AddDays(1));

            var grouped = await revenueQuery
                .Where(order => order.OrderDate >= startUtc && order.OrderDate < endExclusiveUtc)
                .GroupBy(order => order.OrderDate.Date)
                .Select(group => new { Date = group.Key, Total = group.Sum(order => order.TotalAmount) })
                .ToDictionaryAsync(x => DateOnly.FromDateTime(x.Date), x => x.Total, cancellationToken);

            var labels = new List<string>();
            var values = new List<decimal>();
            for (var date = monthStartDate; date <= monthEndDate; date = date.AddDays(1))
            {
                labels.Add(BuildDateLabel(date));
                values.Add(grouped.TryGetValue(date, out var amount) ? amount : 0);
            }

            return Ok(new RevenueSeriesResponse
            {
                Mode = "month",
                Timezone = "UTC",
                Labels = labels.ToArray(),
                Values = values.ToArray(),
                Total = values.Sum(),
                From = monthStartDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                To = monthEndDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)
            });
        }

        private async Task<IActionResult> BuildYearSeriesAsync(IQueryable<Order> revenueQuery, int? year, CancellationToken cancellationToken)
        {
            var selectedYear = year ?? DateTime.UtcNow.Year;
            if (selectedYear < 2000 || selectedYear > 2100)
            {
                return BadRequest(new { message = "year không hợp lệ" });
            }

            var yearStartDate = new DateOnly(selectedYear, 1, 1);
            var yearEndDate = new DateOnly(selectedYear, 12, 31);
            var startUtc = AsUtcStart(yearStartDate);
            var endExclusiveUtc = AsUtcStart(yearEndDate.AddDays(1));

            var grouped = await revenueQuery
                .Where(order => order.OrderDate >= startUtc && order.OrderDate < endExclusiveUtc)
                .GroupBy(order => order.OrderDate.Month)
                .Select(group => new { Month = group.Key, Total = group.Sum(order => order.TotalAmount) })
                .ToDictionaryAsync(x => x.Month, x => x.Total, cancellationToken);

            var labels = new List<string>();
            var values = new List<decimal>();
            for (var monthIndex = 1; monthIndex <= 12; monthIndex++)
            {
                labels.Add($"T{monthIndex}");
                values.Add(grouped.TryGetValue(monthIndex, out var amount) ? amount : 0);
            }

            return Ok(new RevenueSeriesResponse
            {
                Mode = "year",
                Timezone = "UTC",
                Labels = labels.ToArray(),
                Values = values.ToArray(),
                Total = values.Sum(),
                From = yearStartDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                To = yearEndDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)
            });
        }

        private async Task<IActionResult> BuildWeekdaySeriesAsync(IQueryable<Order> revenueQuery, string? from, string? to, CancellationToken cancellationToken)
        {
            var nowUtc = DateTime.UtcNow;
            var defaultFrom = new DateOnly(nowUtc.Year, nowUtc.Month, 1);
            var defaultTo = defaultFrom.AddMonths(1).AddDays(-1);

            var hasFrom = TryParseDateOnly(from, out var fromDate);
            var hasTo = TryParseDateOnly(to, out var toDate);

            var rangeFrom = hasFrom ? fromDate : defaultFrom;
            var rangeTo = hasTo ? toDate : defaultTo;

            if (rangeFrom > rangeTo)
            {
                return BadRequest(new { message = "from phải nhỏ hơn hoặc bằng to" });
            }

            var startUtc = AsUtcStart(rangeFrom);
            var endExclusiveUtc = AsUtcStart(rangeTo.AddDays(1));

            var grouped = await revenueQuery
                .Where(order => order.OrderDate >= startUtc && order.OrderDate < endExclusiveUtc)
                .GroupBy(order => order.OrderDate.DayOfWeek)
                .Select(group => new { DayOfWeek = group.Key, Total = group.Sum(order => order.TotalAmount) })
                .ToDictionaryAsync(x => x.DayOfWeek, x => x.Total, cancellationToken);

            var labels = new List<string>();
            var values = new List<decimal>();
            for (var index = 0; index < 7; index++)
            {
                var dayOfWeek = (DayOfWeek)((index + 1) % 7);
                labels.Add(WeekdayLabels[index]);
                values.Add(grouped.TryGetValue(dayOfWeek, out var amount) ? amount : 0);
            }

            return Ok(new RevenueSeriesResponse
            {
                Mode = "weekday",
                Timezone = "UTC",
                Labels = labels.ToArray(),
                Values = values.ToArray(),
                Total = values.Sum(),
                From = rangeFrom.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                To = rangeTo.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)
            });
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
