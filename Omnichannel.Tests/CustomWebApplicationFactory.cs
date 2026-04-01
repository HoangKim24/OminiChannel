using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Omnichannel.Infrastructure;
using Omnichannel.Models;

namespace Omnichannel.Tests
{
    public class CustomWebApplicationFactory : WebApplicationFactory<Program>
    {
        private readonly string _databaseName = $"OmnichannelTests-{Guid.NewGuid()}";

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");

            builder.ConfigureAppConfiguration((_, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["Jwt:Key"] = "integration-tests-jwt-key-32-characters",
                    ["Jwt:Issuer"] = "Omnichannel",
                    ["Jwt:Audience"] = "Omnichannel.Client",
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

                db.SaveChanges();
            });
        }
    }
}
