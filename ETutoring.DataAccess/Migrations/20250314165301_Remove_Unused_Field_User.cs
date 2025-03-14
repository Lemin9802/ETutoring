using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ETutoring.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class Remove_Unused_Field_User : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "created_by",
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
                name: "hourly_rate",
                table: "users");

            migrationBuilder.DropColumn(
                name: "major",
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "created_by",
                table: "users",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

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

            migrationBuilder.AddColumn<decimal>(
                name: "hourly_rate",
                table: "users",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "major",
                table: "users",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

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
        }
    }
}
