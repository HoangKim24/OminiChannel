using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Moq;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using Omnichannel.Repositories;
using Omnichannel.Services;
using Xunit;

namespace Omnichannel.Tests
{
    public class OrderFacadeTests
    {
        private static OmnichannelDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<OmnichannelDbContext>()
                .UseInMemoryDatabase($"OrderFacadeTests-{System.Guid.NewGuid()}")
                .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            return new OmnichannelDbContext(options);
        }

        [Fact]
        public async Task PlaceOrderAsync_InsufficientStock_ShouldReturnFalse()
        {
            // Arrange
            await using var dbContext = CreateDbContext();
            var uowMock = new Mock<IUnitOfWork>();
            var paymentMock = new Mock<IPaymentStrategy>();
            var inventorySubjectMock = new Mock<InventorySubject>();

            var perfume = new Perfume { Id = 1, StockQuantity = 1, Price = 100 };
            
            var perfumeRepoMock = new Mock<IPerfumeRepository>();
            perfumeRepoMock.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(perfume);
            uowMock.SetupGet(u => u.Perfumes).Returns(perfumeRepoMock.Object);

            var facade = new OrderFacade(dbContext, uowMock.Object, paymentMock.Object, inventorySubjectMock.Object);
            var req = new PlaceOrderRequest { PerfumeId = 1, Quantity = 5, UserId = 1, ShippingAddress = "A", ReceiverPhone = "0" };

            // Act
            var result = await facade.PlaceOrderAsync(req);

            // Assert
            Assert.False(result.Success);
            Assert.Null(result.CreatedOrder);
        }

        [Fact]
        public async Task PlaceOrderAsync_ValidOrder_ShouldPlaceAndReturnUrl()
        {
            // Arrange
            await using var dbContext = CreateDbContext();
            var uowMock = new Mock<IUnitOfWork>();
            var paymentMock = new Mock<IPaymentStrategy>();
            var inventorySubjectMock = new Mock<InventorySubject>();

            var perfume = new Perfume { Id = 1, StockQuantity = 10, Price = 100, Name = "Test Perfume" };
            
            var perfumeRepoMock = new Mock<IPerfumeRepository>();
            perfumeRepoMock.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(perfume);
            uowMock.SetupGet(u => u.Perfumes).Returns(perfumeRepoMock.Object);

            var orderRepoMock = new Mock<IOrderRepository>();
            uowMock.SetupGet(u => u.Orders).Returns(orderRepoMock.Object);

            paymentMock.Setup(p => p.ProcessPaymentAsync(It.IsAny<Order>())).ReturnsAsync("http://payment.url");

            var facade = new OrderFacade(dbContext, uowMock.Object, paymentMock.Object, inventorySubjectMock.Object);
            var req = new PlaceOrderRequest { PerfumeId = 1, Quantity = 2, UserId = 1, ShippingAddress = "Addr", ReceiverPhone = "0123" };

            // Act
            var result = await facade.PlaceOrderAsync(req);

            // Assert
            Assert.True(result.Success);
            Assert.Equal("http://payment.url", result.PaymentUrl);
            Assert.NotNull(result.CreatedOrder);
            Assert.Equal(200, result.CreatedOrder!.TotalAmount);
            Assert.Equal(8, perfume.StockQuantity);

            uowMock.Verify(u => u.CompleteAsync(It.IsAny<CancellationToken>()), Times.Once);
            paymentMock.Verify(p => p.ProcessPaymentAsync(It.IsAny<Order>()), Times.Once);
            inventorySubjectMock.Verify(s => s.NotifyAsync(perfume), Times.Once);
        }
    }
}
