using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Omnichannel.Migrations
{
    /// <inheritdoc />
    public partial class Fix_VoucherRedemption_UniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_VoucherRedemptions_OrderId",
                table: "VoucherRedemptions");

            migrationBuilder.CreateIndex(
                name: "IX_VoucherRedemptions_OrderId_VoucherId",
                table: "VoucherRedemptions",
                columns: new[] { "OrderId", "VoucherId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_VoucherRedemptions_OrderId_VoucherId",
                table: "VoucherRedemptions");

            migrationBuilder.CreateIndex(
                name: "IX_VoucherRedemptions_OrderId",
                table: "VoucherRedemptions",
                column: "OrderId",
                unique: true);
        }
    }
}
