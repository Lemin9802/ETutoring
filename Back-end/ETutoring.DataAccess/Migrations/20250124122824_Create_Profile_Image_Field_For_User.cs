using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ETutoring.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class Create_Profile_Image_Field_For_User : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "profile_picture",
                table: "users",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "profile_picture",
                table: "users");
        }
    }
}
