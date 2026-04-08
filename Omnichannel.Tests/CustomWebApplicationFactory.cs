using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.IdentityModel.Tokens;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;

namespace Omnichannel.Tests
{
    public class CustomWebApplicationFactory : WebApplicationFactory<Program>
    {
        private readonly string _databaseName = $"OmnichannelTests-{Guid.NewGuid()}";
        private const string TestJwtKey = "integration-tests-jwt-key-32-characters";
        private const string TestJwtIssuer = "Omnichannel";
        private const string TestJwtAudience = "Omnichannel.Client";

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");

            builder.ConfigureAppConfiguration((_, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["Jwt:Key"] = TestJwtKey,
                    ["Jwt:Issuer"] = TestJwtIssuer,
                    ["Jwt:Audience"] = TestJwtAudience,
                    ["VNPay:TmnCode"] = "TESTCODE",
                    ["VNPay:HashSecret"] = "TESTSECRET1234567890TESTSECRET1234567890",
                    ["VNPay:BaseUrl"] = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
                    ["VNPay:ReturnUrl"] = "http://localhost/api/payment/vnpay-return"
                });
            });

            builder.ConfigureServices(services =>
            {
                services.RemoveAll(typeof(DbContextOptions<OmnichannelDbContext>));
                services.RemoveAll(typeof(OmnichannelDbContext));

                services.AddDbContext<OmnichannelDbContext>(options =>
                {
                    options.UseInMemoryDatabase(_databaseName);
                });

                using var scope = services.BuildServiceProvider().CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<OmnichannelDbContext>();
                db.Database.EnsureCreated();

                if (!db.Users.Any(x => x.Id == 2))
                {
                    db.Users.Add(new User
                    {
                        Id = 2,
                        Username = "seed_user",
                        Password = BCrypt.Net.BCrypt.HashPassword("User@123"),
                        Role = "User",
                        FullName = "Seed User",
                        Email = "seed-user@test.local"
                    });
                }

                if (!db.Perfumes.Any(x => x.Id == 1))
                {
                    db.Perfumes.Add(new Perfume
                    {
                        Id = 1,
                        Name = "Integration Perfume",
                        Brand = "KP",
                        Price = 10m,
                        StockQuantity = 20,
                        Gender = "Unisex",
                        Description = "Integration test perfume",
                        ImageUrl = "https://example.com/perfume.png"
                    });
                }

                if (!db.Vouchers.Any(x => x.Id == 1001))
                {
                    db.Vouchers.AddRange(
                        new Voucher
                        {
                            Id = 1001,
                            Code = "TESTORDER10",
                            Name = "Test Order 10%",
                            Description = "Integration test order voucher",
                            VoucherType = VoucherTypes.Order,
                            DiscountType = VoucherDiscountTypes.Percentage,
                            DiscountValue = 10m,
                            MaxDiscountAmount = 50000m,
                            MinOrderValue = 50m,
                            StartAt = DateTime.UtcNow.AddDays(-1),
                            EndAt = DateTime.UtcNow.AddDays(30),
                            UsageLimitTotal = 10,
                            UsageLimitPerUser = 2,
                            IsActive = true,
                            IsDeleted = false,
                            SalesChannelId = null
                        },
                        new Voucher
                        {
                            Id = 1002,
                            Code = "TESTSHIP5K",
                            Name = "Test Shipping 5K",
                            Description = "Integration test shipping voucher",
                            VoucherType = VoucherTypes.Shipping,
                            DiscountType = VoucherDiscountTypes.FixedAmount,
                            DiscountValue = 5000m,
                            MaxDiscountAmount = null,
                            MinOrderValue = 50m,
                            StartAt = DateTime.UtcNow.AddDays(-1),
                            EndAt = DateTime.UtcNow.AddDays(30),
                            UsageLimitTotal = 10,
                            UsageLimitPerUser = 2,
                            IsActive = true,
                            IsDeleted = false,
                            SalesChannelId = null
                        }
                    );
                }

                db.SaveChanges();
            });
        }

        public string CreateJwtToken(int userId, string role, string? username = null)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role, role),
                new Claim(ClaimTypes.Name, username ?? $"user_{userId}")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(TestJwtKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: TestJwtIssuer,
                audience: TestJwtAudience,
                claims: claims,
                notBefore: DateTime.UtcNow.AddMinutes(-1),
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public HttpClient CreateAuthenticatedClient(int userId, string role, string? username = null)
        {
            var client = CreateClient();
            var token = CreateJwtToken(userId, role, username);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            return client;
        }

        public HttpClient CreateAdminClient(int userId = 1, string username = "integration_admin")
        {
            return CreateAuthenticatedClient(userId, "Admin", username);
        }

        public HttpClient CreateUserClient(int userId = 2, string username = "integration_user")
        {
            return CreateAuthenticatedClient(userId, "User", username);
        }
    }
}
