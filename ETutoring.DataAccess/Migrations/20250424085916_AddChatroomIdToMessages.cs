using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ETutoring.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddChatroomIdToMessages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add the 'chatroom_id' column to 'messages'
            migrationBuilder.AddColumn<Guid>(
                name: "chatroom_id",
                table: "messages",
                type: "uuid",
                nullable: true); // Keep it nullable for safer rollout

            // Add the foreign key relationship to 'chatting_rooms'
            migrationBuilder.AddForeignKey(
                name: "fk_messages_chatting_rooms_chatroom_id",
                table: "messages",
                column: "chatroom_id",
                principalTable: "chatting_rooms",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop the foreign key first
            migrationBuilder.DropForeignKey(
                name: "fk_messages_chatting_rooms_chatroom_id",
                table: "messages");

            // Drop the 'chatroom_id' column from 'messages'
            migrationBuilder.DropColumn(
                name: "chatroom_id",
                table: "messages");
        }

    }
}
