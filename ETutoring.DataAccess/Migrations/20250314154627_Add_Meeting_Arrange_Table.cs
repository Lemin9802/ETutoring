using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ETutoring.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class Add_Meeting_Arrange_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_meetings_application_user_student_id",
                table: "meetings");

            migrationBuilder.DropForeignKey(
                name: "fk_meetings_application_user_tutor_id",
                table: "meetings");

            migrationBuilder.RenameColumn(
                name: "tutor_id",
                table: "meetings",
                newName: "receiver_id");

            migrationBuilder.RenameColumn(
                name: "student_id",
                table: "meetings",
                newName: "creator_id");

            migrationBuilder.RenameIndex(
                name: "ix_meetings_tutor_id",
                table: "meetings",
                newName: "ix_meetings_receiver_id");

            migrationBuilder.RenameIndex(
                name: "ix_meetings_student_id",
                table: "meetings",
                newName: "ix_meetings_creator_id");

            migrationBuilder.AddColumn<int>(
                name: "status",
                table: "meetings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_meetings_asp_net_users_creator_id",
                table: "meetings");

            migrationBuilder.DropForeignKey(
                name: "fk_meetings_asp_net_users_receiver_id",
                table: "meetings");

            migrationBuilder.DropColumn(
                name: "status",
                table: "meetings");

            migrationBuilder.RenameColumn(
                name: "receiver_id",
                table: "meetings",
                newName: "tutor_id");

            migrationBuilder.RenameColumn(
                name: "creator_id",
                table: "meetings",
                newName: "student_id");

            migrationBuilder.RenameIndex(
                name: "ix_meetings_receiver_id",
                table: "meetings",
                newName: "ix_meetings_tutor_id");

            migrationBuilder.RenameIndex(
                name: "ix_meetings_creator_id",
                table: "meetings",
                newName: "ix_meetings_student_id");

            migrationBuilder.AddForeignKey(
                name: "fk_meetings_application_user_student_id",
                table: "meetings",
                column: "student_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_meetings_application_user_tutor_id",
                table: "meetings",
                column: "tutor_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
