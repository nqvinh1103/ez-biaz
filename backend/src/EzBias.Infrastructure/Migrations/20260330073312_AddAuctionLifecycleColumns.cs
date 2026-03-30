using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EzBias.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAuctionLifecycleColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "EndedAt",
                table: "Auctions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "FinalPrice",
                table: "Auctions",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Auctions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "WinnerId",
                table: "Auctions",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndedAt",
                table: "Auctions");

            migrationBuilder.DropColumn(
                name: "FinalPrice",
                table: "Auctions");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Auctions");

            migrationBuilder.DropColumn(
                name: "WinnerId",
                table: "Auctions");
        }
    }
}
