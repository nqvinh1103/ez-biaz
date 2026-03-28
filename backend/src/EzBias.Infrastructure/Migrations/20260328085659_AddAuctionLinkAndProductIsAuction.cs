using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EzBias.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAuctionLinkAndProductIsAuction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsAuction",
                table: "Products",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ProductId",
                table: "Auctions",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Products_IsAuction",
                table: "Products",
                column: "IsAuction");

            migrationBuilder.CreateIndex(
                name: "IX_Auctions_ProductId",
                table: "Auctions",
                column: "ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_Auctions_Products_ProductId",
                table: "Auctions",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Auctions_Products_ProductId",
                table: "Auctions");

            migrationBuilder.DropIndex(
                name: "IX_Products_IsAuction",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Auctions_ProductId",
                table: "Auctions");

            migrationBuilder.DropColumn(
                name: "IsAuction",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "ProductId",
                table: "Auctions");
        }
    }
}
