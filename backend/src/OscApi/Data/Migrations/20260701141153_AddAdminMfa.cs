using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OscApi.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminMfa : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "MfaEnabled",
                table: "admin_users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "MfaSecret",
                table: "admin_users",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MfaEnabled",
                table: "admin_users");

            migrationBuilder.DropColumn(
                name: "MfaSecret",
                table: "admin_users");
        }
    }
}
