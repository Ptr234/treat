using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OscApi.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTicketAccessToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AccessToken",
                table: "tickets",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            // Give every existing ticket its own unguessable token (two v4 UUIDs,
            // ~244 random bits; gen_random_uuid is built into PostgreSQL 13+).
            // Tracking links in emails sent before this migration carried the
            // email address instead; those visitors can request a fresh link.
            migrationBuilder.Sql(
                "UPDATE tickets SET \"AccessToken\" = " +
                "replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '') " +
                "WHERE \"AccessToken\" = '';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AccessToken",
                table: "tickets");
        }
    }
}
