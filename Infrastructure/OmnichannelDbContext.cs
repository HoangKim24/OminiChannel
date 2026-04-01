using Microsoft.EntityFrameworkCore;
using Omnichannel.Models;

namespace Omnichannel.Infrastructure
{
    public class OmnichannelDbContext : DbContext
    {
        public OmnichannelDbContext(DbContextOptions<OmnichannelDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Perfume> Perfumes { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<SalesChannel> SalesChannels { get; set; }
        public DbSet<ChannelProduct> ChannelProducts { get; set; }
        public DbSet<ChannelOrder> ChannelOrders { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Voucher> Vouchers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<Category>().ToTable("Categories");
            modelBuilder.Entity<Perfume>().ToTable("Perfumes");
            modelBuilder.Entity<Order>().ToTable("Orders");
            modelBuilder.Entity<OrderItem>().ToTable("OrderItems");
            modelBuilder.Entity<SalesChannel>().ToTable("SalesChannels");
            modelBuilder.Entity<ChannelProduct>().ToTable("ChannelProducts");
            modelBuilder.Entity<ChannelOrder>().ToTable("ChannelOrders");
            modelBuilder.Entity<Comment>().ToTable("Comments");

            modelBuilder.Entity<Perfume>()
                .HasOne(p => p.Category)
                .WithMany()
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Order>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(o => o.UserId);

            modelBuilder.Entity<OrderItem>()
                .HasOne<Order>()
                .WithMany(o => o.Items)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Omnichannel relationships
            modelBuilder.Entity<ChannelProduct>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ChannelPrice).HasPrecision(18, 2);
                entity.HasOne(d => d.SalesChannel)
                    .WithMany()
                    .HasForeignKey(d => d.SalesChannelId)
                    .OnDelete(DeleteBehavior.Cascade); // Added OnDelete based on original config
                entity.HasOne(d => d.Perfume)
                    .WithMany()
                    .HasForeignKey(d => d.PerfumeId)
                    .OnDelete(DeleteBehavior.Cascade); // Added OnDelete based on original config
                entity.HasIndex(cp => new { cp.SalesChannelId, cp.PerfumeId }) // Moved index configuration inside
                    .IsUnique();
            });

            modelBuilder.Entity<Perfume>().Property(p => p.Price).HasPrecision(18, 2);
            modelBuilder.Entity<Order>().Property(o => o.TotalAmount).HasPrecision(18, 2);
            modelBuilder.Entity<Order>().Property(o => o.DiscountAmount).HasPrecision(18, 2);
            modelBuilder.Entity<OrderItem>().Property(oi => oi.Price).HasPrecision(18, 2);
            modelBuilder.Entity<Voucher>().Property(v => v.DiscountAmount).HasPrecision(18, 2);
            modelBuilder.Entity<Voucher>().Property(v => v.MinOrderValue).HasPrecision(18, 2);

            // Performance Indexes
            modelBuilder.Entity<Perfume>().HasIndex(p => p.Gender);
            modelBuilder.Entity<Order>().HasIndex(o => o.UserId);
            modelBuilder.Entity<Order>().HasIndex(o => o.Status);
            modelBuilder.Entity<Comment>().HasIndex(c => c.PerfumeId);
            modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();

            modelBuilder.Entity<ChannelOrder>()
                .HasOne(co => co.SalesChannel)
                .WithMany()
                .HasForeignKey(co => co.SalesChannelId);

            modelBuilder.Entity<ChannelOrder>()
                .HasOne(co => co.Order)
                .WithMany()
                .HasForeignKey(co => co.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Seed demo data
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Username = "admin",
                    Password = "$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
                    Email = "admin@kp-luxury.local",
                    FullName = "System Admin",
                    Role = "Admin"
                },
                new User
                {
                    Id = 2,
                    Username = "userdemo",
                    Password = "$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
                    Email = "user@kp-luxury.local",
                    FullName = "Demo User",
                    Role = "User"
                }
            );

            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, CategoryName = "Floral" },
                new Category { Id = 2, CategoryName = "Woody" },
                new Category { Id = 3, CategoryName = "Fresh" }
            );

            modelBuilder.Entity<Perfume>().HasData(
                new Perfume
                {
                    Id = 1,
                    Name = "Golden Bloom",
                    Brand = "KP Luxury",
                    Price = 89.99m,
                    Description = "Floral signature with elegant warm base.",
                    ImageUrl = "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80",
                    CategoryId = 1,
                    Gender = "Nữ",
                    StockQuantity = 120,
                    TopNotes = "Bergamot, Orange Blossom",
                    MiddleNotes = "Rose, Jasmine",
                    BaseNotes = "Musk, Vanilla",
                    Origin = "France",
                    Concentration = "EDP",
                    BrandStory = "Crafted for graceful evenings.",
                    VolumeOptions = "30ml:0.7,50ml:1.0,100ml:1.6"
                },
                new Perfume
                {
                    Id = 2,
                    Name = "Midnight Cedar",
                    Brand = "KP Luxury",
                    Price = 99.50m,
                    Description = "Woody aromatic blend for modern professionals.",
                    ImageUrl = "https://images.unsplash.com/photo-1595425977377-9a6f0f0fef87?auto=format&fit=crop&w=800&q=80",
                    CategoryId = 2,
                    Gender = "Nam",
                    StockQuantity = 90,
                    TopNotes = "Grapefruit, Pepper",
                    MiddleNotes = "Lavender, Sage",
                    BaseNotes = "Cedarwood, Amber",
                    Origin = "Italy",
                    Concentration = "EDT",
                    BrandStory = "A bold and structured masculine trail.",
                    VolumeOptions = "50ml:1.0,100ml:1.6"
                },
                new Perfume
                {
                    Id = 3,
                    Name = "Ocean Whisper",
                    Brand = "KP Luxury",
                    Price = 79.00m,
                    Description = "Fresh unisex scent inspired by coastal mornings.",
                    ImageUrl = "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=800&q=80",
                    CategoryId = 3,
                    Gender = "Unisex",
                    StockQuantity = 140,
                    TopNotes = "Lemon, Sea Salt",
                    MiddleNotes = "Neroli, Green Tea",
                    BaseNotes = "Cedar, White Musk",
                    Origin = "Spain",
                    Concentration = "EDP",
                    BrandStory = "Freshness designed for daily confidence.",
                    VolumeOptions = "30ml:0.7,50ml:1.0,100ml:1.6"
                }
            );

            modelBuilder.Entity<SalesChannel>().HasData(
                new SalesChannel
                {
                    Id = 1,
                    ChannelName = "Website",
                    IsActive = true,
                    LogoUrl = "https://ui-avatars.com/api/?name=Website&background=111&color=c5a059",
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new SalesChannel
                {
                    Id = 2,
                    ChannelName = "Shopee",
                    IsActive = true,
                    LogoUrl = "https://cdn.worldvectorlogo.com/logos/shopee-2.svg",
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new SalesChannel
                {
                    Id = 3,
                    ChannelName = "Lazada",
                    IsActive = true,
                    LogoUrl = "https://upload.wikimedia.org/wikipedia/commons/d/df/Lazada_Logo.png",
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new SalesChannel
                {
                    Id = 4,
                    ChannelName = "TikTok Shop",
                    IsActive = true,
                    LogoUrl = "https://cdn-icons-png.flaticon.com/512/3046/3046121.png",
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                }
            );
        }
    }
}
