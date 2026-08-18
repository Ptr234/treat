using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OscApi.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBusinessRegistrations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LinkedBusinessRegistrationRef",
                table: "investor_profiles",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "business_registrations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReferenceNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    BusinessName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    BusinessType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    BusinessStructure = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    BusinessDescription = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Sector = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Location = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    OwnersJson = table.Column<string>(type: "text", nullable: false),
                    InitialCapital = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ProjectedTurnover = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ContactName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ContactEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ContactPhone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    AssignedAgencyCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ReviewNotes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    RejectionReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    NameDecisionAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CertificateNumber = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    CertificateIssuedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_business_registrations", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_Action",
                table: "audit_logs",
                column: "Action");

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_Timestamp_ActorEmail",
                table: "audit_logs",
                columns: new[] { "Timestamp", "ActorEmail" });

            migrationBuilder.CreateIndex(
                name: "IX_admin_users_AgencyCode",
                table: "admin_users",
                column: "AgencyCode");

            migrationBuilder.CreateIndex(
                name: "IX_admin_users_PasswordResetToken",
                table: "admin_users",
                column: "PasswordResetToken");

            migrationBuilder.CreateIndex(
                name: "IX_business_registrations_AssignedAgencyCode",
                table: "business_registrations",
                column: "AssignedAgencyCode");

            migrationBuilder.CreateIndex(
                name: "IX_business_registrations_BusinessName",
                table: "business_registrations",
                column: "BusinessName");

            migrationBuilder.CreateIndex(
                name: "IX_business_registrations_ContactEmail",
                table: "business_registrations",
                column: "ContactEmail");

            migrationBuilder.CreateIndex(
                name: "IX_business_registrations_ReferenceNumber",
                table: "business_registrations",
                column: "ReferenceNumber",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "business_registrations");

            migrationBuilder.DropIndex(
                name: "IX_audit_logs_Action",
                table: "audit_logs");

            migrationBuilder.DropIndex(
                name: "IX_audit_logs_Timestamp_ActorEmail",
                table: "audit_logs");

            migrationBuilder.DropIndex(
                name: "IX_admin_users_AgencyCode",
                table: "admin_users");

            migrationBuilder.DropIndex(
                name: "IX_admin_users_PasswordResetToken",
                table: "admin_users");

            migrationBuilder.DropColumn(
                name: "LinkedBusinessRegistrationRef",
                table: "investor_profiles");
        }
    }
}
