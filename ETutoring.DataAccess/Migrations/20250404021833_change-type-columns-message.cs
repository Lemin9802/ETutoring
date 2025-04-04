using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace ETutoring.DataAccess.Migrations
{
    public partial class changetypecolumnsmessage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create chatting_rooms table
            migrationBuilder.CreateTable(
                name: "chatting_rooms",
                columns: table => new
                {
                    id = table.Column<Guid>(nullable: false),
                    student_id = table.Column<Guid>(nullable: false),
                    tutor_id = table.Column<Guid>(nullable: false),
                    created_at = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_chatting_rooms", x => x.id);
                });

            // Create messages table
            migrationBuilder.CreateTable(
                name: "messages",
                columns: table => new
                {
                    id = table.Column<Guid>(nullable: false),
                    sender_id = table.Column<Guid>(nullable: false),
                    receiver_id = table.Column<Guid>(nullable: false),
                    content = table.Column<string>(nullable: false),
                    chatroom_id = table.Column<Guid>(nullable: true),
                    timestamp = table.Column<DateTime>(nullable: false),
                    is_deleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_messages", x => x.id);
                    table.ForeignKey(
                        name: "FK_Messages_ChattingRooms_ChatroomId",
                        column: x => x.chatroom_id,
                        principalTable: "chatting_rooms",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            // Create index on chatroom_id for faster lookups in messages
            migrationBuilder.CreateIndex(
                name: "IX_Messages_ChatroomId",
                table: "messages",
                column: "chatroom_id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "messages");
            migrationBuilder.DropTable(name: "chatting_rooms");
        }
    }
}
