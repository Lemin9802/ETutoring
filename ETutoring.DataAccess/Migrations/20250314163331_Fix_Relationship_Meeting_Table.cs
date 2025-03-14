using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ETutoring.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class Fix_Relationship_Meeting_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_meetings_asp_net_users_creator_id",
                table: "meetings");

            migrationBuilder.DropForeignKey(
                name: "fk_meetings_asp_net_users_receiver_id",
                table: "meetings");

            migrationBuilder.AddForeignKey(
                name: "fk_meetings_application_user_creator_id",
                table: "meetings",
                column: "creator_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_meetings_application_user_receiver_id",
                table: "meetings",
                column: "receiver_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_meetings_application_user_creator_id",
                table: "meetings");

            migrationBuilder.DropForeignKey(
                name: "fk_meetings_application_user_receiver_id",
                table: "meetings");

            migrationBuilder.AddForeignKey(
                name: "fk_meetings_asp_net_users_creator_id",
                table: "meetings",
                column: "creator_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_meetings_asp_net_users_receiver_id",
                table: "meetings",
                column: "receiver_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
