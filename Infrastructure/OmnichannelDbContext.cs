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
            modelBuilder.Entity<OrderItem>().Property(oi => oi.Price).HasPrecision(18, 2);

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
        }
    }
}
