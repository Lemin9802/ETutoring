using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ETutoring.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class UpdateChatRoomsColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                @"ALTER TABLE chatting_rooms
            ALTER COLUMN student_id TYPE uuid USING student_id::uuid;

          ALTER TABLE chatting_rooms
            ALTER COLUMN tutor_id TYPE uuid USING tutor_id::uuid;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                @"ALTER TABLE chatting_rooms
            ALTER COLUMN student_id TYPE text USING student_id::text;

          ALTER TABLE chatting_rooms
            ALTER COLUMN tutor_id TYPE text USING tutor_id::text;");
        }
    }
}
