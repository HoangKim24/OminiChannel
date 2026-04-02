using Microsoft.EntityFrameworkCore;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using Omnichannel.Services;
using Xunit;

namespace Omnichannel.Tests
{
    public class VoucherPricingServiceTests
    {
        private static OmnichannelDbContext CreateContext()
        {
            var options = new DbContextOptionsBuilder<OmnichannelDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            var context = new OmnichannelDbContext(options);
            context.Database.EnsureCreated();
            return context;
        }

        [Fact]
        public async Task ApplyAsync_PercentageVoucher_WithMaxCap_ShouldCapDiscount()
        {
            using var context = CreateContext();
            context.Vouchers.Add(new Voucher
            {
                Id = 2001,
                Code = "CAP20",
                Name = "Cap 20",
                VoucherType = VoucherTypes.Order,
                DiscountType = VoucherDiscountTypes.Percentage,
                DiscountValue = 20m,
                MaxDiscountAmount = 150m,
                MinOrderValue = 100m,
                StartAt = DateTime.UtcNow.AddDays(-1),
                EndAt = DateTime.UtcNow.AddDays(1),
                UsageLimitTotal = 10,
                UsageLimitPerUser = 2,
                IsActive = true,
                IsDeleted = false
            });
            context.SaveChanges();

            var service = new VoucherPricingService(context);
            var result = await service.ApplyAsync(new VoucherApplyRequest
            {
                UserId = 2,
                ItemsSubtotal = 1000m,
                ShippingFee = 0m,
                VoucherCode = "CAP20"
            });

            Assert.Equal(150m, result.OrderVoucherDiscount);
            Assert.Equal(850m, result.FinalTotal);
        }

        [Fact]
        public async Task ApplyAsync_FixedShippingVoucher_ShouldNotExceedShippingFee()
        {
            using var context = CreateContext();
            context.Vouchers.Add(new Voucher
            {
                Id = 2002,
                Code = "SHIP5000",
                Name = "Ship 5000",
                VoucherType = VoucherTypes.Shipping,
                DiscountType = VoucherDiscountTypes.FixedAmount,
                DiscountValue = 5000m,
                MinOrderValue = 100m,
                StartAt = DateTime.UtcNow.AddDays(-1),
                EndAt = DateTime.UtcNow.AddDays(1),
                UsageLimitTotal = 10,
                UsageLimitPerUser = 2,
                IsActive = true,
                IsDeleted = false
            });
            context.SaveChanges();

            var service = new VoucherPricingService(context);
            var result = await service.ApplyAsync(new VoucherApplyRequest
            {
                UserId = 2,
                ItemsSubtotal = 500m,
                ShippingFee = 3000m,
                VoucherCode = "SHIP5000"
            });

            Assert.Equal(3000m, result.ShippingVoucherDiscount);
            Assert.Equal(500m, result.FinalTotal);
        }

        [Fact]
        public async Task ApplyAsync_WhenUsageLimitPerUserReached_ShouldReturnError()
        {
            using var context = CreateContext();
            context.Vouchers.Add(new Voucher
            {
                Id = 2003,
                Code = "LIMIT1",
                Name = "Limit 1",
                VoucherType = VoucherTypes.Order,
                DiscountType = VoucherDiscountTypes.FixedAmount,
                DiscountValue = 100m,
                MinOrderValue = 10m,
                StartAt = DateTime.UtcNow.AddDays(-1),
                EndAt = DateTime.UtcNow.AddDays(1),
                UsageLimitTotal = 5,
                UsageLimitPerUser = 1,
                IsActive = true,
                IsDeleted = false
            });
            context.VoucherRedemptions.Add(new VoucherRedemption
            {
                Id = 3001,
                VoucherId = 2003,
                UserId = 2,
                OrderId = 10,
                DiscountAmount = 100m,
                RedeemedAt = DateTime.UtcNow.AddMinutes(-1)
            });
            context.SaveChanges();

            var service = new VoucherPricingService(context);

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => service.ApplyAsync(new VoucherApplyRequest
            {
                UserId = 2,
                ItemsSubtotal = 500m,
                ShippingFee = 0m,
                VoucherCode = "LIMIT1"
            }));

            Assert.Contains("giới hạn sử dụng", exception.Message, StringComparison.OrdinalIgnoreCase);
        }
    }
}
