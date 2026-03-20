using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ETutoring.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class Update_Users_Details : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_refresh_tokens_users_user_id",
                table: "refresh_tokens");

            migrationBuilder.AlterColumn<string>(
                name: "phone_number",
                table: "users",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "address",
                table: "users",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "created_by",
                table: "users",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "date_of_birth",
                table: "users",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "department",
                table: "users",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "enrollment_date",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "experience_years",
                table: "users",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "full_name",
                table: "users",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "gender",
                table: "users",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "hourly_rate",
                table: "users",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "identification_number",
                table: "users",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_email_confirmed",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_phone_confirmed",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "last_login_time",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "major",
                table: "users",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "nationality",
                table: "users",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "position",
                table: "users",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "salary",
                table: "users",
                type: "numeric(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "updated_by",
                table: "users",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "fk_refresh_tokens_application_user_user_id",
                table: "refresh_tokens",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_refresh_tokens_application_user_user_id",
                table: "refresh_tokens");

            migrationBuilder.DropColumn(
                name: "address",
                table: "users");

            migrationBuilder.DropColumn(
                name: "created_by",
                table: "users");

            migrationBuilder.DropColumn(
                name: "date_of_birth",
                table: "users");

            migrationBuilder.DropColumn(
                name: "department",
                table: "users");

            migrationBuilder.DropColumn(
                name: "enrollment_date",
                table: "users");

            migrationBuilder.DropColumn(
                name: "experience_years",
                table: "users");

            migrationBuilder.DropColumn(
                name: "full_name",
                table: "users");

            migrationBuilder.DropColumn(
                name: "gender",
                table: "users");

            migrationBuilder.DropColumn(
                name: "hourly_rate",
                table: "users");

            migrationBuilder.DropColumn(
                name: "identification_number",
                table: "users");

            migrationBuilder.DropColumn(
                name: "is_active",
                table: "users");

            migrationBuilder.DropColumn(
                name: "is_email_confirmed",
                table: "users");

            migrationBuilder.DropColumn(
                name: "is_phone_confirmed",
                table: "users");

            migrationBuilder.DropColumn(
                name: "last_login_time",
                table: "users");

            migrationBuilder.DropColumn(
                name: "major",
                table: "users");

            migrationBuilder.DropColumn(
                name: "nationality",
                table: "users");

            migrationBuilder.DropColumn(
                name: "position",
                table: "users");

            migrationBuilder.DropColumn(
                name: "salary",
                table: "users");

            migrationBuilder.DropColumn(
                name: "updated_by",
                table: "users");

            migrationBuilder.AlterColumn<string>(
                name: "phone_number",
                table: "users",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AddForeignKey(
                name: "fk_refresh_tokens_users_user_id",
                table: "refresh_tokens",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
