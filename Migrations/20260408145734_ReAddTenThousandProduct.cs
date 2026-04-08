using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Omnichannel.Migrations
{
    /// <inheritdoc />
    public partial class ReAddTenThousandProduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF NOT EXISTS (
    SELECT 1
    FROM [Perfumes]
    WHERE [Name] = N'Sản phẩm 10 ngàn' AND [Price] = 10000.0
)
BEGIN
    INSERT INTO [Perfumes]
    (
        [Name],
        [Brand],
        [Price],
        [Description],
        [ImageUrl],
        [CategoryId],
        [Gender],
        [StockQuantity],
        [TopNotes],
        [MiddleNotes],
        [BaseNotes],
        [Origin],
        [Concentration],
        [BrandStory],
        [VolumeOptions]
    )
    VALUES
    (
        N'Sản phẩm 10 ngàn',
        N'KP Luxury',
        10000.0,
        N'Sản phẩm được khôi phục theo yêu cầu.',
        N'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
        4,
        N'Unisex',
        25,
        N'Fresh Citrus',
        N'White Floral',
        N'Musk',
        N'France',
        N'EDP',
        N'Restored product',
        N'30ml:1.0'
    );
END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DELETE FROM [Perfumes]
WHERE [Name] = N'Sản phẩm 10 ngàn'
  AND [Price] = 10000.0
  AND [Brand] = N'KP Luxury';
");
        }
    }
}
