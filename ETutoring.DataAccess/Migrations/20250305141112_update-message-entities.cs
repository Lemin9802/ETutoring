using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ETutoring.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class updatemessageentities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "chatroom_id",
                table: "messages",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_messages_chatroom_id",
                table: "messages",
                column: "chatroom_id");

            migrationBuilder.AddForeignKey(
                name: "fk_messages_chatting_rooms_chatroom_id",
                table: "messages",
                column: "chatroom_id",
                principalTable: "chatting_rooms",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_messages_chatting_rooms_chatroom_id",
                table: "messages");

            migrationBuilder.DropIndex(
                name: "ix_messages_chatroom_id",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "chatroom_id",
                table: "messages");
        }
    }
}
