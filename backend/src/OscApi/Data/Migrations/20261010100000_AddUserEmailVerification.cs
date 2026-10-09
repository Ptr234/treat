using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using OscApi.Data;

#nullable disable

namespace OscApi.Data.Migrations;

// [DbContext]/[Migration] live in the .Designer.cs partial, as EF generates them.
public partial class AddUserEmailVerification : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(
            name: "EmailVerified", table: "users", type: "boolean", nullable: false, defaultValue: false);
        migrationBuilder.AddColumn<string>(
            name: "EmailVerificationToken", table: "users", type: "character varying(64)", maxLength: 64, nullable: true);
        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "EmailVerificationExpiresAt", table: "users", type: "timestamp with time zone", nullable: true);
        migrationBuilder.CreateIndex(
            name: "IX_users_EmailVerificationToken", table: "users", column: "EmailVerificationToken");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(name: "IX_users_EmailVerificationToken", table: "users");
        migrationBuilder.DropColumn(name: "EmailVerified", table: "users");
        migrationBuilder.DropColumn(name: "EmailVerificationToken", table: "users");
        migrationBuilder.DropColumn(name: "EmailVerificationExpiresAt", table: "users");
    }
}
