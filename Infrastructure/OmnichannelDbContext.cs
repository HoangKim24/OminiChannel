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
        public DbSet<VoucherRedemption> VoucherRedemptions { get; set; }
        public DbSet<Recommendation> Recommendations { get; set; }

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
            modelBuilder.Entity<Recommendation>().ToTable("Recommendations");

            modelBuilder.Entity<Perfume>()
                .HasOne(p => p.Category)
                .WithMany()
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Recommendation>()
                .HasOne(r => r.SourcePerfume)
                .WithMany()
                .HasForeignKey(r => r.SourcePerfumeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Recommendation>()
                .HasOne(r => r.RecommendedPerfume)
                .WithMany()
                .HasForeignKey(r => r.RecommendedPerfumeId)
                .OnDelete(DeleteBehavior.NoAction);

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

            // Performance Indexes
            modelBuilder.Entity<Perfume>().HasIndex(p => p.Gender);
            modelBuilder.Entity<Order>().HasIndex(o => o.UserId);
            modelBuilder.Entity<Order>().HasIndex(o => o.Status);
            modelBuilder.Entity<Comment>().HasIndex(c => c.PerfumeId);
            modelBuilder.Entity<Recommendation>().HasIndex(r => r.SourcePerfumeId);
            modelBuilder.Entity<Recommendation>().HasIndex(r => r.CoOccurrenceScore);
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

            modelBuilder.Entity<Voucher>(entity =>
            {
                entity.ToTable("Vouchers");
                entity.Property(v => v.Code).HasMaxLength(64).IsRequired();
                entity.Property(v => v.Name).HasMaxLength(120).IsRequired();
                entity.Property(v => v.VoucherType).HasMaxLength(20).IsRequired();
                entity.Property(v => v.DiscountType).HasMaxLength(20).IsRequired();
                entity.Property(v => v.DiscountValue).HasPrecision(18, 2);
                entity.Property(v => v.MaxDiscountAmount).HasPrecision(18, 2);
                entity.Property(v => v.MinOrderValue).HasPrecision(18, 2);
                entity.HasIndex(v => v.Code).IsUnique();
                entity.HasOne(v => v.SalesChannel)
                    .WithMany()
                    .HasForeignKey(v => v.SalesChannelId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<VoucherRedemption>(entity =>
            {
                entity.ToTable("VoucherRedemptions");
                entity.Property(v => v.DiscountAmount).HasPrecision(18, 2);
                entity.HasOne(v => v.Voucher)
                    .WithMany(v => v.Redemptions)
                    .HasForeignKey(v => v.VoucherId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasIndex(v => new { v.VoucherId, v.UserId });
                entity.HasIndex(v => v.OrderId).IsUnique();
            });

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

            modelBuilder.Entity<Voucher>().HasData(
                new Voucher
                {
                    Id = 1,
                    Code = "WELCOME10",
                    Name = "Welcome 10%",
                    Description = "Giảm 10% cho đơn hàng đầu tiên",
                    VoucherType = VoucherTypes.Order,
                    DiscountType = VoucherDiscountTypes.Percentage,
                    DiscountValue = 10m,
                    MaxDiscountAmount = 4.17m,
                    MinOrderValue = 15m,
                    StartAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    EndAt = new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc),
                    UsageLimitTotal = 100,
                    UsageLimitPerUser = 1,
                    SalesChannelId = null,
                    IsActive = true,
                    IsDeleted = false
                },
                new Voucher
                {
                    Id = 2,
                    Code = "ORDER50K",
                    Name = "Order -50K",
                    Description = "Giảm 50,000đ trên tổng đơn hàng",
                    VoucherType = VoucherTypes.Order,
                    DiscountType = VoucherDiscountTypes.FixedAmount,
                    DiscountValue = 2.08m,
                    MaxDiscountAmount = null,
                    MinOrderValue = 20m,
                    StartAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    EndAt = new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc),
                    UsageLimitTotal = 50,
                    UsageLimitPerUser = 2,
                    SalesChannelId = null,
                    IsActive = true,
                    IsDeleted = false
                },
                new Voucher
                {
                    Id = 3,
                    Code = "VIP15",
                    Name = "VIP 15%",
                    Description = "Giảm 15% cho khách VIP trên website",
                    VoucherType = VoucherTypes.Order,
                    DiscountType = VoucherDiscountTypes.Percentage,
                    DiscountValue = 15m,
                    MaxDiscountAmount = 8.33m,
                    MinOrderValue = 40m,
                    StartAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    EndAt = new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc),
                    UsageLimitTotal = 20,
                    UsageLimitPerUser = 1,
                    SalesChannelId = 1,
                    IsActive = true,
                    IsDeleted = false
                },
                new Voucher
                {
                    Id = 4,
                    Code = "SHIP20K",
                    Name = "Ship -20K",
                    Description = "Giảm 20,000đ phí ship",
                    VoucherType = VoucherTypes.Shipping,
                    DiscountType = VoucherDiscountTypes.FixedAmount,
                    DiscountValue = 0.83m,
                    MaxDiscountAmount = null,
                    MinOrderValue = 12m,
                    StartAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    EndAt = new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc),
                    UsageLimitTotal = 100,
                    UsageLimitPerUser = 3,
                    SalesChannelId = null,
                    IsActive = true,
                    IsDeleted = false
                },
                new Voucher
                {
                    Id = 5,
                    Code = "SHIP10",
                    Name = "Ship 10%",
                    Description = "Giảm 10% phí ship, tối đa 50,000đ",
                    VoucherType = VoucherTypes.Shipping,
                    DiscountType = VoucherDiscountTypes.Percentage,
                    DiscountValue = 10m,
                    MaxDiscountAmount = 2.08m,
                    MinOrderValue = 20m,
                    StartAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    EndAt = new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc),
                    UsageLimitTotal = 75,
                    UsageLimitPerUser = 2,
                    SalesChannelId = 1,
                    IsActive = true,
                    IsDeleted = false
                }
            );
        }
    }
}
