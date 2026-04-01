using System.Net;
using System.Net.Http.Json;
using Omnichannel.Models;

namespace Omnichannel.Tests
{
    public class AuthOrderIntegrationTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;

        public AuthOrderIntegrationTests(CustomWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task Register_WithValidPayload_ShouldCreateUser()
        {
            var username = $"adminit_{Guid.NewGuid():N}";

            var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", new RegisterRequest
            {
                Username = username,
                Password = "Admin@123",
                FullName = "Integration Admin",
                Email = "admin@test.local"
            });
            Assert.Equal(HttpStatusCode.Created, registerResponse.StatusCode);

            var raw = await registerResponse.Content.ReadAsStringAsync();
            Assert.Contains("thành công", raw, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public async Task PlaceOrder_WithValidPayload_ShouldCreateOrder()
        {
            var orderRequest = new PlaceOrderRequest
            {
                UserId = 2,
                PerfumeId = 1,
                Quantity = 2,
                ShippingAddress = "123 Test Street",
                ReceiverPhone = "0909000000",
                Note = "integration"
            };

            var response = await _client.PostAsJsonAsync("/api/orders", orderRequest);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            var raw = await response.Content.ReadAsStringAsync();
            Assert.Contains("orderId", raw, StringComparison.OrdinalIgnoreCase);
            Assert.Contains("paymentUrl", raw, StringComparison.OrdinalIgnoreCase);
        }
    }
}
