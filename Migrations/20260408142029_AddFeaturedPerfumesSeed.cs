using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Omnichannel.Migrations
{
    /// <inheritdoc />
    public partial class AddFeaturedPerfumesSeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
SET IDENTITY_INSERT [Categories] ON;

IF NOT EXISTS (SELECT 1 FROM [Categories] WHERE [Id] = 4)
BEGIN
    INSERT INTO [Categories] ([Id], [CategoryName]) VALUES (4, N'Designer');
END
ELSE
BEGIN
    UPDATE [Categories] SET [CategoryName] = N'Designer' WHERE [Id] = 4;
END

IF NOT EXISTS (SELECT 1 FROM [Categories] WHERE [Id] = 5)
BEGIN
    INSERT INTO [Categories] ([Id], [CategoryName]) VALUES (5, N'Niche');
END
ELSE
BEGIN
    UPDATE [Categories] SET [CategoryName] = N'Niche' WHERE [Id] = 5;
END

IF NOT EXISTS (SELECT 1 FROM [Categories] WHERE [Id] = 6)
BEGIN
    INSERT INTO [Categories] ([Id], [CategoryName]) VALUES (6, N'Luxury');
END
ELSE
BEGIN
    UPDATE [Categories] SET [CategoryName] = N'Luxury' WHERE [Id] = 6;
END

SET IDENTITY_INSERT [Categories] OFF;

IF NOT EXISTS (SELECT 1 FROM [Perfumes] WHERE [Id] = 4)
BEGIN
    SET IDENTITY_INSERT [Perfumes] ON;
    INSERT INTO [Perfumes] ([Id], [BaseNotes], [Brand], [BrandStory], [CategoryId], [Concentration], [Description], [Gender], [ImageUrl], [MiddleNotes], [Name], [Origin], [Price], [StockQuantity], [TopNotes], [VolumeOptions])
    VALUES (4, N'Gỗ tuyết tùng, đàn hương, hổ phách', N'Chanel', N'Biểu tượng nam tính hiện đại của Chanel, đậm chất lịch lãm và tự do.', 4, N'Parfum', N'Một mùi hương mạnh mẽ, tinh tế với sự kết hợp của gỗ tuyết tùng, đàn hương và cam quýt.', N'Nam', N'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80', N'Gừng, nhục đậu khấu, hoa hồng', N'Bleu de Chanel Parfum', N'France', 3850000.0, 25, N'Cam quýt, chanh vàng, bưởi', N'50ml:1.0,100ml:1.6');
    SET IDENTITY_INSERT [Perfumes] OFF;
END
ELSE
BEGIN
    UPDATE [Perfumes]
    SET [BaseNotes] = N'Gỗ tuyết tùng, đàn hương, hổ phách',
        [Brand] = N'Chanel',
        [BrandStory] = N'Biểu tượng nam tính hiện đại của Chanel, đậm chất lịch lãm và tự do.',
        [CategoryId] = 4,
        [Concentration] = N'Parfum',
        [Description] = N'Một mùi hương mạnh mẽ, tinh tế với sự kết hợp của gỗ tuyết tùng, đàn hương và cam quýt.',
        [Gender] = N'Nam',
        [ImageUrl] = N'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
        [MiddleNotes] = N'Gừng, nhục đậu khấu, hoa hồng',
        [Name] = N'Bleu de Chanel Parfum',
        [Origin] = N'France',
        [Price] = 3850000.0,
        [StockQuantity] = 25,
        [TopNotes] = N'Cam quýt, chanh vàng, bưởi',
        [VolumeOptions] = N'50ml:1.0,100ml:1.6'
    WHERE [Id] = 4;
END

IF NOT EXISTS (SELECT 1 FROM [Perfumes] WHERE [Id] = 5)
BEGIN
    SET IDENTITY_INSERT [Perfumes] ON;
    INSERT INTO [Perfumes] ([Id], [BaseNotes], [Brand], [BrandStory], [CategoryId], [Concentration], [Description], [Gender], [ImageUrl], [MiddleNotes], [Name], [Origin], [Price], [StockQuantity], [TopNotes], [VolumeOptions])
    VALUES (5, N'Gỗ đàn hương, da thuộc, xạ hương', N'Le Labo', N'Một hương thơm unisex mang tính biểu tượng, được yêu thích bởi giới mộ điệu.', 5, N'EDP', N'Biểu tượng của sự cá tính với mùi hương đặc trưng của gỗ đàn hương, bạch đậu khấu và hoa violet.', N'Unisex', N'https://images.unsplash.com/photo-1595425977377-9a6f0f0fef87?auto=format&fit=crop&w=800&q=80', N'Diên vĩ, papyrus', N'Le Labo Santal 33', N'United States', 5200000.0, 10, N'Bạch đậu khấu, violet', N'50ml:1.0');
    SET IDENTITY_INSERT [Perfumes] OFF;
END
ELSE
BEGIN
    UPDATE [Perfumes]
    SET [BaseNotes] = N'Gỗ đàn hương, da thuộc, xạ hương',
        [Brand] = N'Le Labo',
        [BrandStory] = N'Một hương thơm unisex mang tính biểu tượng, được yêu thích bởi giới mộ điệu.',
        [CategoryId] = 5,
        [Concentration] = N'EDP',
        [Description] = N'Biểu tượng của sự cá tính với mùi hương đặc trưng của gỗ đàn hương, bạch đậu khấu và hoa violet.',
        [Gender] = N'Unisex',
        [ImageUrl] = N'https://images.unsplash.com/photo-1595425977377-9a6f0f0fef87?auto=format&fit=crop&w=800&q=80',
        [MiddleNotes] = N'Diên vĩ, papyrus',
        [Name] = N'Le Labo Santal 33',
        [Origin] = N'United States',
        [Price] = 5200000.0,
        [StockQuantity] = 10,
        [TopNotes] = N'Bạch đậu khấu, violet',
        [VolumeOptions] = N'50ml:1.0'
    WHERE [Id] = 5;
END

IF NOT EXISTS (SELECT 1 FROM [Perfumes] WHERE [Id] = 6)
BEGIN
    SET IDENTITY_INSERT [Perfumes] ON;
    INSERT INTO [Perfumes] ([Id], [BaseNotes], [Brand], [BrandStory], [CategoryId], [Concentration], [Description], [Gender], [ImageUrl], [MiddleNotes], [Name], [Origin], [Price], [StockQuantity], [TopNotes], [VolumeOptions])
    VALUES (6, N'Hoắc hương, cỏ vetiver', N'Narciso Rodriguez', N'Tinh tế, nữ tính và đầy gợi cảm - dấu ấn đặc trưng của Narciso Rodriguez.', 4, N'EDP', N'Mùi hương quyến rũ bậc nhất với nốt xạ hương chủ đạo, kết hợp cùng hoa hồng và đào.', N'Nữ', N'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=800&q=80', N'Xạ hương, hổ phách', N'Narciso Rodriguez For Her', N'France', 2950000.0, 40, N'Hoa hồng, đào', N'50ml:1.0,100ml:1.6');
    SET IDENTITY_INSERT [Perfumes] OFF;
END
ELSE
BEGIN
    UPDATE [Perfumes]
    SET [BaseNotes] = N'Hoắc hương, cỏ vetiver',
        [Brand] = N'Narciso Rodriguez',
        [BrandStory] = N'Tinh tế, nữ tính và đầy gợi cảm - dấu ấn đặc trưng của Narciso Rodriguez.',
        [CategoryId] = 4,
        [Concentration] = N'EDP',
        [Description] = N'Mùi hương quyến rũ bậc nhất với nốt xạ hương chủ đạo, kết hợp cùng hoa hồng và đào.',
        [Gender] = N'Nữ',
        [ImageUrl] = N'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=800&q=80',
        [MiddleNotes] = N'Xạ hương, hổ phách',
        [Name] = N'Narciso Rodriguez For Her',
        [Origin] = N'France',
        [Price] = 2950000.0,
        [StockQuantity] = 40,
        [TopNotes] = N'Hoa hồng, đào',
        [VolumeOptions] = N'50ml:1.0,100ml:1.6'
    WHERE [Id] = 6;
END

IF NOT EXISTS (SELECT 1 FROM [Perfumes] WHERE [Id] = 7)
BEGIN
    SET IDENTITY_INSERT [Perfumes] ON;
    INSERT INTO [Perfumes] ([Id], [BaseNotes], [Brand], [BrandStory], [CategoryId], [Concentration], [Description], [Gender], [ImageUrl], [MiddleNotes], [Name], [Origin], [Price], [StockQuantity], [TopNotes], [VolumeOptions])
    VALUES (7, N'Gỗ sồi, khói, long diên hương', N'Creed', N'Một trong những mùi hương nam giới kinh điển và quyền lực nhất thế giới niche-luxury.', 6, N'EDP', N'Ông hoàng của dòng nước hoa nam với hương dứa nướng, khói và long diên hương.', N'Nam', N'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80', N'Hoa nhài, hoắc hương', N'Creed Aventus', N'United Kingdom', 7500000.0, 5, N'Dứa, bergamot, lý chua đen', N'50ml:1.0,100ml:1.6');
    SET IDENTITY_INSERT [Perfumes] OFF;
END
ELSE
BEGIN
    UPDATE [Perfumes]
    SET [BaseNotes] = N'Gỗ sồi, khói, long diên hương',
        [Brand] = N'Creed',
        [BrandStory] = N'Một trong những mùi hương nam giới kinh điển và quyền lực nhất thế giới niche-luxury.',
        [CategoryId] = 6,
        [Concentration] = N'EDP',
        [Description] = N'Ông hoàng của dòng nước hoa nam với hương dứa nướng, khói và long diên hương.',
        [Gender] = N'Nam',
        [ImageUrl] = N'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
        [MiddleNotes] = N'Hoa nhài, hoắc hương',
        [Name] = N'Creed Aventus',
        [Origin] = N'United Kingdom',
        [Price] = 7500000.0,
        [StockQuantity] = 5,
        [TopNotes] = N'Dứa, bergamot, lý chua đen',
        [VolumeOptions] = N'50ml:1.0,100ml:1.6'
    WHERE [Id] = 7;
END

IF NOT EXISTS (SELECT 1 FROM [Perfumes] WHERE [Id] = 8)
BEGIN
    SET IDENTITY_INSERT [Perfumes] ON;
    INSERT INTO [Perfumes] ([Id], [BaseNotes], [Brand], [BrandStory], [CategoryId], [Concentration], [Description], [Gender], [ImageUrl], [MiddleNotes], [Name], [Origin], [Price], [StockQuantity], [TopNotes], [VolumeOptions])
    VALUES (8, N'Xạ hương trắng', N'Dior', N'Một bó hoa thanh lịch dành cho phong cách nữ tính, nhẹ nhàng và hiện đại.', 4, N'EDT', N'Một bó hoa tươi thắm với hương mẫu đơn và hoa hồng Damask nhẹ nhàng, thanh khiết.', N'Nữ', N'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=800&q=80', N'Mẫu đơn, hoa hồng Damask', N'Miss Dior Blooming Bouquet', N'France', 2150000.0, 15, N'Quýt hồng, cam bergamot', N'50ml:1.0');
    SET IDENTITY_INSERT [Perfumes] OFF;
END
ELSE
BEGIN
    UPDATE [Perfumes]
    SET [BaseNotes] = N'Xạ hương trắng',
        [Brand] = N'Dior',
        [BrandStory] = N'Một bó hoa thanh lịch dành cho phong cách nữ tính, nhẹ nhàng và hiện đại.',
        [CategoryId] = 4,
        [Concentration] = N'EDT',
        [Description] = N'Một bó hoa tươi thắm với hương mẫu đơn và hoa hồng Damask nhẹ nhàng, thanh khiết.',
        [Gender] = N'Nữ',
        [ImageUrl] = N'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=800&q=80',
        [MiddleNotes] = N'Mẫu đơn, hoa hồng Damask',
        [Name] = N'Miss Dior Blooming Bouquet',
        [Origin] = N'France',
        [Price] = 2150000.0,
        [StockQuantity] = 15,
        [TopNotes] = N'Quýt hồng, cam bergamot',
        [VolumeOptions] = N'50ml:1.0'
    WHERE [Id] = 8;
END
" );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Perfumes",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Perfumes",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Perfumes",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Perfumes",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Perfumes",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 6);
        }
    }
}
