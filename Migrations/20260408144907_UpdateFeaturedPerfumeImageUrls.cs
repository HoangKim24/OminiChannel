using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Omnichannel.Migrations
{
    /// <inheritdoc />
    public partial class UpdateFeaturedPerfumeImageUrls : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Perfumes",
                keyColumn: "Id",
                keyValue: 4,
                column: "ImageUrl",
                value: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80");

            migrationBuilder.UpdateData(
                table: "Perfumes",
                keyColumn: "Id",
                keyValue: 5,
                column: "ImageUrl",
                value: "https://images.unsplash.com/photo-1595425977377-9a6f0f0fef87?auto=format&fit=crop&w=800&q=80");

            migrationBuilder.UpdateData(
                table: "Perfumes",
                keyColumn: "Id",
                keyValue: 6,
                column: "ImageUrl",
                value: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=800&q=80");

            migrationBuilder.UpdateData(
                table: "Perfumes",
                keyColumn: "Id",
                keyValue: 7,
                column: "ImageUrl",
                value: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80");

            migrationBuilder.UpdateData(
                table: "Perfumes",
                keyColumn: "Id",
                keyValue: 8,
                column: "ImageUrl",
                value: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=800&q=80");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Perfumes",
                keyColumn: "Id",
                keyValue: 4,
                column: "ImageUrl",
                value: "https://perfume-store.com/images/chanel-bleu-1.jpg");

            migrationBuilder.UpdateData(
                table: "Perfumes",
                keyColumn: "Id",
                keyValue: 5,
                column: "ImageUrl",
                value: "https://perfume-store.com/images/lelabo-santal-1.jpg");

            migrationBuilder.UpdateData(
                table: "Perfumes",
                keyColumn: "Id",
                keyValue: 6,
                column: "ImageUrl",
                value: "https://perfume-store.com/images/narciso-pink-1.jpg");

            migrationBuilder.UpdateData(
                table: "Perfumes",
                keyColumn: "Id",
                keyValue: 7,
                column: "ImageUrl",
                value: "https://perfume-store.com/images/creed-aventus-1.jpg");

            migrationBuilder.UpdateData(
                table: "Perfumes",
                keyColumn: "Id",
                keyValue: 8,
                column: "ImageUrl",
                value: "https://perfume-store.com/images/dior-blooming-1.jpg");
        }
    }
}
