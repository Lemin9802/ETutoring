using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ETutoring.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMessageColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                @"ALTER TABLE messages
                ALTER COLUMN sender_id TYPE uuid USING sender_id::uuid;
                ALTER TABLE messages
                ALTER COLUMN receiver_id TYPE uuid USING receiver_id::uuid;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                @"ALTER TABLE messages
                ALTER COLUMN sender_id TYPE text USING sender_id::text;
                ALTER TABLE messages
                ALTER COLUMN receiver_id TYPE text USING receiver_id::text;");
        }
    }
}
