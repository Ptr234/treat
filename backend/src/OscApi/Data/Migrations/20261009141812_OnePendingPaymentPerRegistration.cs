using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OscApi.Data.Migrations
{
    /// <inheritdoc />
    public partial class OnePendingPaymentPerRegistration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Before the bug fix every "Pay" click opened another pending payment,
            // so existing data may hold several per registration — which would make
            // the unique index below fail to build (and, with migrations run at
            // startup, stop the API booting). Keep the newest pending checkout per
            // registration and close the rest, exactly as the service now does.
            // A webhook for a closed one is still honoured if it was actually paid.
            migrationBuilder.Sql(@"
UPDATE payments SET ""Status"" = 'Failed', ""FailureReason"" = 'Superseded by a newer checkout'
WHERE ""Id"" IN (
    SELECT ""Id"" FROM (
        SELECT ""Id"", row_number() OVER (PARTITION BY ""BusinessRegistrationRef"" ORDER BY ""CreatedAt"" DESC) AS rn
        FROM payments WHERE ""Status"" = 'Pending'
    ) ranked WHERE rn > 1
);");

            migrationBuilder.CreateIndex(
                name: "IX_payments_one_pending_per_registration",
                table: "payments",
                column: "BusinessRegistrationRef",
                unique: true,
                filter: "\"Status\" = 'Pending'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_payments_one_pending_per_registration",
                table: "payments");
        }
    }
}
