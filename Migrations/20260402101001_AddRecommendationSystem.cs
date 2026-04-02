using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Omnichannel.Migrations
{
    /// <inheritdoc />
    public partial class AddRecommendationSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Recommendations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SourcePerfumeId = table.Column<int>(type: "int", nullable: false),
                    RecommendedPerfumeId = table.Column<int>(type: "int", nullable: false),
                    CoOccurrenceScore = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recommendations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Recommendations_Perfumes_RecommendedPerfumeId",
                        column: x => x.RecommendedPerfumeId,
                        principalTable: "Perfumes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Recommendations_Perfumes_SourcePerfumeId",
                        column: x => x.SourcePerfumeId,
                        principalTable: "Perfumes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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

            migrationBuilder.CreateIndex(
                name: "IX_Recommendations_CoOccurrenceScore",
                table: "Recommendations",
                column: "CoOccurrenceScore");

            migrationBuilder.CreateIndex(
                name: "IX_Recommendations_RecommendedPerfumeId",
                table: "Recommendations",
                column: "RecommendedPerfumeId");

            migrationBuilder.CreateIndex(
                name: "IX_Recommendations_SourcePerfumeId",
                table: "Recommendations",
                column: "SourcePerfumeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Recommendations");

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "MaxDiscountAmount", "MinOrderValue" },
                values: new object[] { 100000m, 300000m });

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "DiscountValue", "MinOrderValue" },
                values: new object[] { 50000m, 500000m });

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "MaxDiscountAmount", "MinOrderValue" },
                values: new object[] { 200000m, 1000000m });

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "DiscountValue", "MinOrderValue" },
                values: new object[] { 20000m, 300000m });

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "MaxDiscountAmount", "MinOrderValue" },
                values: new object[] { 50000m, 500000m });
        }
    }
}
