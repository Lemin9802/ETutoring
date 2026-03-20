using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace ETutoring.DataAccess.Migrations
{
    public partial class changetypecolumnsmessage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Xóa bảng nếu nó đã tồn tại
            migrationBuilder.Sql("DROP TABLE IF EXISTS chatting_rooms CASCADE;");
            migrationBuilder.Sql("DROP TABLE IF EXISTS messages CASCADE;");

            // Tạo bảng mới
            migrationBuilder.CreateTable(
                name: "chatting_rooms",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    student_id = table.Column<string>(type: "text", nullable: false),
                    tutor_id = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table => { table.PrimaryKey("pk_chatting_rooms", x => x.id); });

            migrationBuilder.CreateTable(
                name: "messages",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    sender_id = table.Column<string>(type: "text", nullable: false),
                    receiver_id = table.Column<string>(type: "text", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table => { table.PrimaryKey("pk_messages", x => x.id); });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "chatting_rooms");

            migrationBuilder.DropTable(
                name: "messages");
        }
    }
}
