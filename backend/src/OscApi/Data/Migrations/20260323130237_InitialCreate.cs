using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OscApi.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "admin_users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_admin_users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "agency_messages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Channel = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Content = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: false),
                    SenderName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SenderAgencyCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    SenderEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    IsInternal = table.Column<bool>(type: "boolean", nullable: false),
                    SentAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_agency_messages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "chat_enquiries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    UserName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    UserEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    UserPhone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    UserLocation = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    UserMessage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    BotResponse = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: false),
                    Language = table.Column<string>(type: "text", nullable: false),
                    Sentiment = table.Column<string>(type: "text", nullable: true),
                    Tier = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_chat_enquiries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "investor_profiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReferenceNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Nationality = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CompanyName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Position = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    InvestorType = table.Column<string>(type: "text", nullable: false),
                    Experience = table.Column<string>(type: "text", nullable: false),
                    InvestmentGoal = table.Column<string>(type: "text", nullable: false),
                    InvestmentAmount = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TimeHorizon = table.Column<string>(type: "text", nullable: false),
                    RiskTolerance = table.Column<string>(type: "text", nullable: false),
                    PrimarySector = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SecondarySectors = table.Column<string[]>(type: "jsonb", nullable: false),
                    SpecificInterests = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CapitalSource = table.Column<string>(type: "text", nullable: false),
                    Timeframe = table.Column<string>(type: "text", nullable: false),
                    SupportNeeded = table.Column<string[]>(type: "jsonb", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_investor_profiles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tickets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReferenceNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    Priority = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ContactName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ContactEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ContactPhone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    InvestorNationality = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Sector = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    InvestmentSize = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Assignee = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AssignedAgencyCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    SlaDeadlineHours = table.Column<int>(type: "integer", nullable: true),
                    SlaDeadlineAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    SatisfactionRating = table.Column<int>(type: "integer", nullable: true),
                    SatisfactionComment = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    IsEscalated = table.Column<bool>(type: "boolean", nullable: false),
                    EscalatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ResolvedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    ClosedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tickets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ticket_documents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TicketId = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    MimeType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    StorageUrl = table.Column<string>(type: "text", nullable: false),
                    UploadedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ticket_documents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ticket_documents_tickets_TicketId",
                        column: x => x.TicketId,
                        principalTable: "tickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ticket_messages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TicketId = table.Column<Guid>(type: "uuid", nullable: false),
                    Content = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: false),
                    AuthorName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AuthorRole = table.Column<string>(type: "text", nullable: false),
                    AuthorEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    IsInternal = table.Column<bool>(type: "boolean", nullable: false),
                    SentAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ticket_messages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ticket_messages_tickets_TicketId",
                        column: x => x.TicketId,
                        principalTable: "tickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_admin_users_Email",
                table: "admin_users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_agency_messages_Channel_SentAt",
                table: "agency_messages",
                columns: new[] { "Channel", "SentAt" });

            migrationBuilder.CreateIndex(
                name: "IX_chat_enquiries_CreatedAt",
                table: "chat_enquiries",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_chat_enquiries_SessionId_CreatedAt",
                table: "chat_enquiries",
                columns: new[] { "SessionId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_investor_profiles_Email",
                table: "investor_profiles",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_investor_profiles_ReferenceNumber",
                table: "investor_profiles",
                column: "ReferenceNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ticket_documents_TicketId",
                table: "ticket_documents",
                column: "TicketId");

            migrationBuilder.CreateIndex(
                name: "IX_ticket_messages_TicketId",
                table: "ticket_messages",
                column: "TicketId");

            migrationBuilder.CreateIndex(
                name: "IX_tickets_ContactEmail",
                table: "tickets",
                column: "ContactEmail");

            migrationBuilder.CreateIndex(
                name: "IX_tickets_IsEscalated",
                table: "tickets",
                column: "IsEscalated",
                filter: "\"IsEscalated\" = true");

            migrationBuilder.CreateIndex(
                name: "IX_tickets_ReferenceNumber",
                table: "tickets",
                column: "ReferenceNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_tickets_Status_CreatedAt",
                table: "tickets",
                columns: new[] { "Status", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "admin_users");

            migrationBuilder.DropTable(
                name: "agency_messages");

            migrationBuilder.DropTable(
                name: "chat_enquiries");

            migrationBuilder.DropTable(
                name: "investor_profiles");

            migrationBuilder.DropTable(
                name: "ticket_documents");

            migrationBuilder.DropTable(
                name: "ticket_messages");

            migrationBuilder.DropTable(
                name: "tickets");
        }
    }
}
