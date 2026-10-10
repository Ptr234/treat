using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OscApi.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTicketAssignmentHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "AssignedAt",
                table: "tickets",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "AssigneeUserId",
                table: "tickets",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "FirstResponseAt",
                table: "tickets",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "SlaBreachedAt",
                table: "tickets",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ticket_events",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TicketId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    FromValue = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ToValue = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ActorName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ActorEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    OccurredAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ticket_events", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ticket_events_tickets_TicketId",
                        column: x => x.TicketId,
                        principalTable: "tickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_tickets_AssigneeUserId",
                table: "tickets",
                column: "AssigneeUserId");

            migrationBuilder.CreateIndex(
                name: "IX_tickets_SlaBreachedAt_SlaDeadlineAt",
                table: "tickets",
                columns: new[] { "SlaBreachedAt", "SlaDeadlineAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ticket_events_TicketId_OccurredAt",
                table: "ticket_events",
                columns: new[] { "TicketId", "OccurredAt" });

            migrationBuilder.AddForeignKey(
                name: "FK_tickets_admin_users_AssigneeUserId",
                table: "tickets",
                column: "AssigneeUserId",
                principalTable: "admin_users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            // Link existing free-text assignees to the staff account with that name,
            // where exactly one active account matches. Others stay as a display label
            // until an officer is chosen from the staff list.
            migrationBuilder.Sql("""
                UPDATE tickets t
                SET "AssigneeUserId" = a."Id", "Assignee" = a."Name"
                FROM admin_users a
                WHERE t."AssigneeUserId" IS NULL
                  AND t."Assignee" IS NOT NULL
                  AND a."IsActive"
                  AND lower(a."Name") = lower(btrim(t."Assignee"))
                  AND (SELECT count(*) FROM admin_users b
                       WHERE b."IsActive" AND lower(b."Name") = lower(btrim(t."Assignee"))) = 1;
                """);

            // Tickets already overdue were already reported on the board; flag them
            // as handled so the SLA monitor's first run alerts only on new breaches
            // instead of emailing about the whole backlog at once.
            migrationBuilder.Sql("""
                UPDATE tickets
                SET "SlaBreachedAt" = "SlaDeadlineAt"
                WHERE "SlaDeadlineAt" IS NOT NULL AND "SlaDeadlineAt" < now()
                  AND "Status" NOT IN ('Resolved', 'Closed');
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tickets_admin_users_AssigneeUserId",
                table: "tickets");

            migrationBuilder.DropTable(
                name: "ticket_events");

            migrationBuilder.DropIndex(
                name: "IX_tickets_AssigneeUserId",
                table: "tickets");

            migrationBuilder.DropIndex(
                name: "IX_tickets_SlaBreachedAt_SlaDeadlineAt",
                table: "tickets");

            migrationBuilder.DropColumn(
                name: "AssignedAt",
                table: "tickets");

            migrationBuilder.DropColumn(
                name: "AssigneeUserId",
                table: "tickets");

            migrationBuilder.DropColumn(
                name: "FirstResponseAt",
                table: "tickets");

            migrationBuilder.DropColumn(
                name: "SlaBreachedAt",
                table: "tickets");
        }
    }
}
