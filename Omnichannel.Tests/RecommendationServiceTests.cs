using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using Omnichannel.Services;
using Xunit;

namespace Omnichannel.Tests
{
    public class RecommendationServiceTests
    {
        private OmnichannelDbContext GetInMemoryContext()
        {
            var options = new DbContextOptionsBuilder<OmnichannelDbContext>()
                .UseInMemoryDatabase(databaseName: System.Guid.NewGuid().ToString())
                .Options;

            var context = new OmnichannelDbContext(options);
            
            context.Perfumes.AddRange(
                new Perfume { Id = 1, Name = "Rose Floral", Gender = "Female", TopNotes = "Rose, Peony", MiddleNotes = "Jasmine", BaseNotes = "Musk", Price = 100 },
                new Perfume { Id = 2, Name = "Woody Men", Gender = "Male", TopNotes = "Citrus", MiddleNotes = "Cedar", BaseNotes = "Sandalwood, Vanilla", Price = 120 },
                new Perfume { Id = 3, Name = "Unisex Fresh", Gender = "Unisex", TopNotes = "Lemon, Mint", MiddleNotes = "Green Tea", BaseNotes = "Amber", Price = 90 }
            );
            context.SaveChanges();
            return context;
        }

        [Fact]
        public async Task GetRecommendationsByNotesAsync_ShouldFilterByGenderAndNotes()
        {
            // Arrange
            using var context = GetInMemoryContext();
            var service = new RecommendationService(context);

            var req = new RecommendationRequest
            {
                Gender = "Female",
                PreferredNotes = new List<string> { "Rose", "Musk" }
            };

            // Act
            var results = await service.GetRecommendationsByNotesAsync(req, 5);

            // Assert
            Assert.NotEmpty(results);
            Assert.True(results.All(r => r.Perfume.Gender == "Female" || r.Perfume.Gender == "Unisex"));
            Assert.Contains(results, r => r.Perfume.Name == "Rose Floral"); // Has both notes
            
            // Expected score for Rose Floral: 1 (top: Rose) + 1 (base: Musk) = 2
            var roseFloralResult = results.First(r => r.Perfume.Name == "Rose Floral");
            Assert.Equal(2, roseFloralResult.MatchScore);
        }

        [Fact]
        public async Task GetRecommendationsByNotesAsync_NoMatches_ShouldReturnEmpty()
        {
            // Arrange
            using var context = GetInMemoryContext();
            var service = new RecommendationService(context);

            var req = new RecommendationRequest
            {
                Gender = "Male",
                PreferredNotes = new List<string> { "Strawberry" }
            };

            // Act
            var results = await service.GetRecommendationsByNotesAsync(req, 5);

            // Assert
            Assert.Empty(results);
        }
    }
}
