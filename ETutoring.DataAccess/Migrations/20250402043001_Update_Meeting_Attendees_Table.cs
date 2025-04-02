using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ETutoring.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class Update_Meeting_Attendees_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_meetings_users_creator_id",
                table: "meetings");

            migrationBuilder.DropForeignKey(
                name: "fk_meetings_users_receiver_id",
                table: "meetings");

            migrationBuilder.DropIndex(
                name: "ix_meetings_receiver_id",
                table: "meetings");

            migrationBuilder.DropColumn(
                name: "receiver_id",
                table: "meetings");

            migrationBuilder.CreateTable(
                name: "meeting_attendee",
                columns: table => new
                {
                    meeting_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_meeting_attendee", x => new { x.meeting_id, x.user_id });
                    table.ForeignKey(
                        name: "fk_meeting_attendee_meetings_meeting_id",
                        column: x => x.meeting_id,
                        principalTable: "meetings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_meeting_attendee_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_meeting_attendee_user_id",
                table: "meeting_attendee",
                column: "user_id");

            migrationBuilder.AddForeignKey(
                name: "fk_meetings_users_creator_id",
                table: "meetings",
                column: "creator_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_meetings_users_creator_id",
                table: "meetings");

            migrationBuilder.DropTable(
                name: "meeting_attendee");

            migrationBuilder.AddColumn<Guid>(
                name: "receiver_id",
                table: "meetings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "ix_meetings_receiver_id",
                table: "meetings",
                column: "receiver_id");

            migrationBuilder.AddForeignKey(
                name: "fk_meetings_users_creator_id",
                table: "meetings",
                column: "creator_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_meetings_users_receiver_id",
                table: "meetings",
                column: "receiver_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
