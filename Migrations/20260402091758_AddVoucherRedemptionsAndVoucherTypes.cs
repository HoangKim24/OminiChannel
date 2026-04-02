using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Omnichannel.Migrations
{
    /// <inheritdoc />
    public partial class AddVoucherRedemptionsAndVoucherTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DiscountAmount",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "UsageLimit",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "UsedCount",
                table: "Vouchers");

            migrationBuilder.RenameColumn(
                name: "ExpiryDate",
                table: "Vouchers",
                newName: "StartAt");

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Vouchers",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Vouchers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DiscountType",
                table: "Vouchers",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountValue",
                table: "Vouchers",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "EndAt",
                table: "Vouchers",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Vouchers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "MaxDiscountAmount",
                table: "Vouchers",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Vouchers",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "SalesChannelId",
                table: "Vouchers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UsageLimitPerUser",
                table: "Vouchers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UsageLimitTotal",
                table: "Vouchers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VoucherType",
                table: "Vouchers",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "VoucherRedemptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    VoucherId = table.Column<int>(type: "int", nullable: false),
                    OrderId = table.Column<int>(type: "int", nullable: false),
                    RedeemedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VoucherRedemptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VoucherRedemptions_Vouchers_VoucherId",
                        column: x => x.VoucherId,
                        principalTable: "Vouchers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.Sql("DELETE FROM [VoucherRedemptions]; DELETE FROM [Vouchers];");

            migrationBuilder.InsertData(
                table: "Vouchers",
                columns: new[] { "Id", "Code", "Description", "DiscountType", "DiscountValue", "EndAt", "IsActive", "IsDeleted", "MaxDiscountAmount", "MinOrderValue", "Name", "SalesChannelId", "StartAt", "UsageLimitPerUser", "UsageLimitTotal", "VoucherType" },
                values: new object[,]
                {
                    { 1, "WELCOME10", "Giảm 10% cho đơn hàng đầu tiên", "Percentage", 10m, new DateTime(2026, 12, 31, 23, 59, 59, 0, DateTimeKind.Utc), true, false, 4.17m, 15m, "Welcome 10%", null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, 100, "Order" },
                    { 2, "ORDER50K", "Giảm 50,000đ trên tổng đơn hàng", "FixedAmount", 2.08m, new DateTime(2026, 12, 31, 23, 59, 59, 0, DateTimeKind.Utc), true, false, null, 20m, "Order -50K", null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, 50, "Order" },
                    { 3, "VIP15", "Giảm 15% cho khách VIP trên website", "Percentage", 15m, new DateTime(2026, 12, 31, 23, 59, 59, 0, DateTimeKind.Utc), true, false, 8.33m, 40m, "VIP 15%", 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, 20, "Order" },
                    { 4, "SHIP20K", "Giảm 20,000đ phí ship", "FixedAmount", 0.83m, new DateTime(2026, 12, 31, 23, 59, 59, 0, DateTimeKind.Utc), true, false, null, 12m, "Ship -20K", null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, 100, "Shipping" },
                    { 5, "SHIP10", "Giảm 10% phí ship, tối đa 50,000đ", "Percentage", 10m, new DateTime(2026, 12, 31, 23, 59, 59, 0, DateTimeKind.Utc), true, false, 2.08m, 20m, "Ship 10%", 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, 75, "Shipping" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Vouchers_Code",
                table: "Vouchers",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Vouchers_SalesChannelId",
                table: "Vouchers",
                column: "SalesChannelId");

            migrationBuilder.CreateIndex(
                name: "IX_VoucherRedemptions_OrderId",
                table: "VoucherRedemptions",
                column: "OrderId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VoucherRedemptions_VoucherId_UserId",
                table: "VoucherRedemptions",
                columns: new[] { "VoucherId", "UserId" });

            migrationBuilder.AddForeignKey(
                name: "FK_Vouchers_SalesChannels_SalesChannelId",
                table: "Vouchers",
                column: "SalesChannelId",
                principalTable: "SalesChannels",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vouchers_SalesChannels_SalesChannelId",
                table: "Vouchers");

            migrationBuilder.DropTable(
                name: "VoucherRedemptions");

            migrationBuilder.DropIndex(
                name: "IX_Vouchers_Code",
                table: "Vouchers");

            migrationBuilder.DropIndex(
                name: "IX_Vouchers_SalesChannelId",
                table: "Vouchers");

            migrationBuilder.DeleteData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "DiscountType",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "DiscountValue",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "EndAt",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "MaxDiscountAmount",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "SalesChannelId",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "UsageLimitPerUser",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "UsageLimitTotal",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "VoucherType",
                table: "Vouchers");

            migrationBuilder.RenameColumn(
                name: "StartAt",
                table: "Vouchers",
                newName: "ExpiryDate");

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Vouchers",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(64)",
                oldMaxLength: 64);

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountAmount",
                table: "Vouchers",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "UsageLimit",
                table: "Vouchers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UsedCount",
                table: "Vouchers",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
