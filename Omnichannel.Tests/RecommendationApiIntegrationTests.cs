using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using Omnichannel.Infrastructure;
using Omnichannel.Models;

namespace Omnichannel.Tests
{
    public class RecommendationApiIntegrationTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory _factory;

        public RecommendationApiIntegrationTests(CustomWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task GetProductRecommendations_WithExistingPerfume_ShouldReturnPayload()
        {
            var response = await _client.GetAsync("/api/perfumes/1/recommendations?limit=4");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal(1, payload.GetProperty("perfumeId").GetInt32());
            Assert.True(payload.TryGetProperty("recommendations", out var recommendations));
            Assert.Equal(JsonValueKind.Array, recommendations.ValueKind);
            Assert.True(payload.GetProperty("count").GetInt32() >= 0);

            // With seeded perfumes, recommendation list for ID=1 should normally contain at least one item.
            Assert.True(recommendations.GetArrayLength() >= 1);
        }

        [Fact]
        public async Task GetProductRecommendations_WithUnknownPerfume_ShouldReturnEmptyRecommendations()
        {
            var response = await _client.GetAsync("/api/perfumes/999999/recommendations?limit=4");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal(999999, payload.GetProperty("perfumeId").GetInt32());
            Assert.Equal(0, payload.GetProperty("count").GetInt32());
            Assert.Equal(0, payload.GetProperty("recommendations").GetArrayLength());
        }

        [Fact]
        public async Task RecommendByPreferences_WithValidRequest_ShouldReturnStructuredResponse()
        {
            var request = new
            {
                preferredNotes = new[] { "Rose", "Musk" },
                gender = "Nữ",
                scentFamily = "Floral"
            };

            var response = await _client.PostAsJsonAsync("/api/perfumes/recommend-by-preferences?limit=5", request);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
            Assert.True(payload.TryGetProperty("recommendations", out var recommendations));
            Assert.Equal(JsonValueKind.Array, recommendations.ValueKind);
            Assert.True(payload.TryGetProperty("count", out var count));
            Assert.True(count.GetInt32() >= 0);
            Assert.True(payload.TryGetProperty("request", out _));
        }

        [Fact]
        public async Task RecommendByPreferences_WithNullBody_ShouldReturnBadRequest()
        {
            using var content = new StringContent("null", Encoding.UTF8, "application/json");

            var response = await _client.PostAsync("/api/perfumes/recommend-by-preferences?limit=5", content);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task GetProductRecommendations_WithLimitOne_ShouldRespectLimit()
        {
            var response = await _client.GetAsync("/api/perfumes/1/recommendations?limit=1");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
            var recommendations = payload.GetProperty("recommendations");

            Assert.Equal(JsonValueKind.Array, recommendations.ValueKind);
            Assert.True(recommendations.GetArrayLength() <= 1);
            Assert.True(payload.GetProperty("count").GetInt32() <= 1);
        }

        [Fact]
        public async Task GetProductRecommendations_ShouldReturnDescendingByScore_WhenCoOccurrenceDataExists()
        {
            using (var scope = _factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<OmnichannelDbContext>();

                db.Recommendations.RemoveRange(db.Recommendations);
                db.Recommendations.AddRange(
                    new Recommendation
                    {
                        SourcePerfumeId = 1,
                        RecommendedPerfumeId = 2,
                        CoOccurrenceScore = 95,
                        Type = "CoSold",
                        LastUpdated = DateTime.UtcNow
                    },
                    new Recommendation
                    {
                        SourcePerfumeId = 1,
                        RecommendedPerfumeId = 3,
                        CoOccurrenceScore = 25,
                        Type = "CoSold",
                        LastUpdated = DateTime.UtcNow
                    });

                db.SaveChanges();
            }

            var response = await _client.GetAsync("/api/perfumes/1/recommendations?limit=2");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
            var recommendations = payload.GetProperty("recommendations");

            Assert.Equal(2, recommendations.GetArrayLength());

            var first = recommendations[0];
            var second = recommendations[1];

            var firstScore = first.GetProperty("score").GetInt32();
            var secondScore = second.GetProperty("score").GetInt32();

            Assert.True(firstScore >= secondScore);
            Assert.Equal(2, first.GetProperty("id").GetInt32());
            Assert.Equal(3, second.GetProperty("id").GetInt32());
        }
    }
}
