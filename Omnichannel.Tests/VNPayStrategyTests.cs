using System.Collections.Generic;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using Omnichannel.Models;
using Omnichannel.Services;
using Xunit;

namespace Omnichannel.Tests
{
    public class VNPayStrategyTests
    {
        [Fact]
        public async void ProcessPaymentAsync_ValidOrder_ShouldGeneratePaymentUrl()
        {
            // Arrange
            var mockConfig = new Dictionary<string, string>
            {
                {"VNPay:TmnCode", "TESTCODE"},
                {"VNPay:HashSecret", "TESTSECRET1234567890TESTSECRET1234567890"},
                {"VNPay:BaseUrl", "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"},
                {"VNPay:ReturnUrl", "http://localhost:5000/api/payment/vnpay_return"}
            };
            var configuration = new ConfigurationBuilder().AddInMemoryCollection(mockConfig!).Build();
            
            var strategy = new VNPayStrategy(configuration);
            var order = new Order { Id = 123, TotalAmount = 500 };

            // Act
            var url = await strategy.ProcessPaymentAsync(order);

            // Assert
            Assert.NotNull(url);
            Assert.Contains("vnp_Amount=50000", url);
            Assert.Contains("vnp_TmnCode=TESTCODE", url);
            Assert.Contains("vnp_TxnRef=123", url);
            Assert.Contains("vnp_SecureHash=", url);
        }

        [Fact]
        public void VerifyReturnSignature_InvalidHash_ShouldReturnFalse()
        {
            var mockConfig = new Dictionary<string, string>
            {
                {"VNPay:TmnCode", "TESTCODE"},
                {"VNPay:HashSecret", "TESTSECRET1234567890TESTSECRET1234567890"},
                {"VNPay:BaseUrl", "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"},
                {"VNPay:ReturnUrl", "http://localhost:5000/api/payment/vnpay_return"}
            };
            var configuration = new ConfigurationBuilder().AddInMemoryCollection(mockConfig!).Build();
            var strategy = new VNPayStrategy(configuration);

            var query = new QueryCollection(new Dictionary<string, Microsoft.Extensions.Primitives.StringValues>
            {
                ["vnp_TxnRef"] = "123",
                ["vnp_Amount"] = "50000",
                ["vnp_ResponseCode"] = "00",
                ["vnp_SecureHash"] = "invalid-hash"
            });

            var isValid = strategy.VerifyReturnSignature(query);
            Assert.False(isValid);
        }
    }
}
