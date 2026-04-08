using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Omnichannel.Migrations
{
    /// <inheritdoc />
    public partial class ConvertMonetaryValuesToVnd : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE [Perfumes] SET [Price] = [Price] * 24000");
            migrationBuilder.Sql("UPDATE [OrderItems] SET [Price] = [Price] * 24000");
            migrationBuilder.Sql("UPDATE [Orders] SET [TotalAmount] = [TotalAmount] * 24000, [DiscountAmount] = [DiscountAmount] * 24000");
            migrationBuilder.Sql("UPDATE [ChannelProducts] SET [ChannelPrice] = [ChannelPrice] * 24000");
            migrationBuilder.Sql("UPDATE [Vouchers] SET [DiscountValue] = CASE WHEN [DiscountType] = 'FixedAmount' THEN [DiscountValue] * 24000 ELSE [DiscountValue] END, [MaxDiscountAmount] = CASE WHEN [MaxDiscountAmount] IS NULL THEN NULL ELSE [MaxDiscountAmount] * 24000 END, [MinOrderValue] = [MinOrderValue] * 24000");
            migrationBuilder.Sql("UPDATE [VoucherRedemptions] SET [DiscountAmount] = [DiscountAmount] * 24000");

            migrationBuilder.UpdateData(
                table: "Perfumes",
                keyColumn: "Id",
                keyValue: 1,
                column: "Price",
                value: 2159760m);

            migrationBuilder.UpdateData(
                table: "Perfumes",
                keyColumn: "Id",
                keyValue: 2,
                column: "Price",
                value: 2388000m);

            migrationBuilder.UpdateData(
                table: "Perfumes",
                keyColumn: "Id",
                keyValue: 3,
                column: "Price",
                value: 1896000m);

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "MaxDiscountAmount", "MinOrderValue" },
                values: new object[] { 100080m, 360000m });

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "DiscountValue", "MinOrderValue" },
                values: new object[] { 49920m, 480000m });

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "MaxDiscountAmount", "MinOrderValue" },
                values: new object[] { 199920m, 960000m });

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "DiscountValue", "MinOrderValue" },
                values: new object[] { 19920m, 288000m });

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "MaxDiscountAmount", "MinOrderValue" },
                values: new object[] { 49920m, 480000m });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE [Perfumes] SET [Price] = [Price] / 24000");
            migrationBuilder.Sql("UPDATE [OrderItems] SET [Price] = [Price] / 24000");
            migrationBuilder.Sql("UPDATE [Orders] SET [TotalAmount] = [TotalAmount] / 24000, [DiscountAmount] = [DiscountAmount] / 24000");
            migrationBuilder.Sql("UPDATE [ChannelProducts] SET [ChannelPrice] = [ChannelPrice] / 24000");
            migrationBuilder.Sql("UPDATE [Vouchers] SET [DiscountValue] = CASE WHEN [DiscountType] = 'FixedAmount' THEN [DiscountValue] / 24000 ELSE [DiscountValue] END, [MaxDiscountAmount] = CASE WHEN [MaxDiscountAmount] IS NULL THEN NULL ELSE [MaxDiscountAmount] / 24000 END, [MinOrderValue] = [MinOrderValue] / 24000");
            migrationBuilder.Sql("UPDATE [VoucherRedemptions] SET [DiscountAmount] = [DiscountAmount] / 24000");

            migrationBuilder.UpdateData(
                table: "Perfumes",
                keyColumn: "Id",
                keyValue: 1,
                column: "Price",
                value: 89.99m);

            migrationBuilder.UpdateData(
                table: "Perfumes",
                keyColumn: "Id",
                keyValue: 2,
                column: "Price",
                value: 99.50m);

            migrationBuilder.UpdateData(
                table: "Perfumes",
                keyColumn: "Id",
                keyValue: 3,
                column: "Price",
                value: 79.00m);

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "MaxDiscountAmount", "MinOrderValue" },
                values: new object[] { 4.17m, 15m });

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "DiscountValue", "MinOrderValue" },
                values: new object[] { 2.08m, 20m });

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "MaxDiscountAmount", "MinOrderValue" },
                values: new object[] { 8.33m, 40m });

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "DiscountValue", "MinOrderValue" },
                values: new object[] { 0.83m, 12m });

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "MaxDiscountAmount", "MinOrderValue" },
                values: new object[] { 2.08m, 20m });
        }
    }
}
