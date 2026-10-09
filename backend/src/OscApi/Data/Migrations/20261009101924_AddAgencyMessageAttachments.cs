using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OscApi.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAgencyMessageAttachments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AttachmentsJson",
                table: "agency_messages",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AttachmentsJson",
                table: "agency_messages");
        }
    }
}
