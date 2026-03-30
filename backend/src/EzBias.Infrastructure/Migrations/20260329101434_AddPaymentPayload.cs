using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EzBias.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentPayload : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Payload",
                table: "Payments",
                type: "character varying(16384)",
                maxLength: 16384,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Payload",
                table: "Payments");
        }
    }
}
