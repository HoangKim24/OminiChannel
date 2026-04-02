using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace Omnichannel.Tests
{
    public class VoucherApiIntegrationTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;

        public VoucherApiIntegrationTests(CustomWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task ValidateVoucher_Get_ShouldReturnValidResponse()
        {
            var response = await _client.GetAsync("/api/vouchers/validate?Code=TESTORDER10&UserId=2&ItemsSubtotal=100000&ShippingFee=50000&SalesChannelId=1");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
            Assert.True(payload.GetProperty("isValid").GetBoolean());
            Assert.Equal("Mã hợp lệ", payload.GetProperty("message").GetString());
            Assert.Equal(10000m, payload.GetProperty("discountAmount").GetDecimal());
        }

        [Fact]
        public async Task ApplyVoucher_Post_ShouldReturnBreakdown()
        {
            var response = await _client.PostAsJsonAsync("/api/vouchers/apply", new
            {
                userId = 2,
                itemsSubtotal = 100000m,
                shippingFee = 50000m,
                orderVoucherCode = "TESTORDER10",
                shippingVoucherCode = "TESTSHIP5K",
                salesChannelId = 1
            });

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal(100000m, payload.GetProperty("itemsSubtotal").GetDecimal());
            Assert.Equal(50000m, payload.GetProperty("shippingFee").GetDecimal());
            Assert.Equal(10000m, payload.GetProperty("orderVoucherDiscount").GetDecimal());
            Assert.Equal(5000m, payload.GetProperty("shippingVoucherDiscount").GetDecimal());
            Assert.Equal(135000m, payload.GetProperty("finalTotal").GetDecimal());
            Assert.Equal(2, payload.GetProperty("appliedVouchers").GetArrayLength());
        }
    }
}
