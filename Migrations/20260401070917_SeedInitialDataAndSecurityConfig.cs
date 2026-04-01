using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Omnichannel.Migrations
{
    /// <inheritdoc />
    public partial class SeedInitialDataAndSecurityConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "CategoryName" },
                values: new object[,]
                {
                    { 1, "Floral" },
                    { 2, "Woody" },
                    { 3, "Fresh" }
                });

            migrationBuilder.InsertData(
                table: "SalesChannels",
                columns: new[] { "Id", "ApiKey", "ChannelName", "CreatedAt", "IsActive", "LogoUrl" },
                values: new object[,]
                {
                    { 1, null, "Website", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, "https://ui-avatars.com/api/?name=Website&background=111&color=c5a059" },
                    { 2, null, "Shopee", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, "https://cdn.worldvectorlogo.com/logos/shopee-2.svg" },
                    { 3, null, "Lazada", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, "https://upload.wikimedia.org/wikipedia/commons/d/df/Lazada_Logo.png" },
                    { 4, null, "TikTok Shop", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, "https://cdn-icons-png.flaticon.com/512/3046/3046121.png" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Address", "Email", "FullName", "Password", "PhoneNumber", "Role", "Username" },
                values: new object[,]
                {
                    { 1, null, "admin@kp-luxury.local", "System Admin", "$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy", null, "Admin", "admin" },
                    { 2, null, "user@kp-luxury.local", "Demo User", "$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy", null, "User", "userdemo" }
                });

            migrationBuilder.InsertData(
                table: "Perfumes",
                columns: new[] { "Id", "BaseNotes", "Brand", "BrandStory", "CategoryId", "Concentration", "Description", "Gender", "ImageUrl", "MiddleNotes", "Name", "Origin", "Price", "StockQuantity", "TopNotes", "VolumeOptions" },
                values: new object[,]
                {
                    { 1, "Musk, Vanilla", "KP Luxury", "Crafted for graceful evenings.", 1, "EDP", "Floral signature with elegant warm base.", "Nữ", "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80", "Rose, Jasmine", "Golden Bloom", "France", 89.99m, 120, "Bergamot, Orange Blossom", "30ml:0.7,50ml:1.0,100ml:1.6" },
                    { 2, "Cedarwood, Amber", "KP Luxury", "A bold and structured masculine trail.", 2, "EDT", "Woody aromatic blend for modern professionals.", "Nam", "https://images.unsplash.com/photo-1595425977377-9a6f0f0fef87?auto=format&fit=crop&w=800&q=80", "Lavender, Sage", "Midnight Cedar", "Italy", 99.50m, 90, "Grapefruit, Pepper", "50ml:1.0,100ml:1.6" },
                    { 3, "Cedar, White Musk", "KP Luxury", "Freshness designed for daily confidence.", 3, "EDP", "Fresh unisex scent inspired by coastal mornings.", "Unisex", "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=800&q=80", "Neroli, Green Tea", "Ocean Whisper", "Spain", 79.00m, 140, "Lemon, Sea Salt", "30ml:0.7,50ml:1.0,100ml:1.6" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Perfumes",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Perfumes",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Perfumes",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "SalesChannels",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "SalesChannels",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "SalesChannels",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "SalesChannels",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 3);
        }
    }
}
