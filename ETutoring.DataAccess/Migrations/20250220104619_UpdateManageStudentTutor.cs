using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ETutoring.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class UpdateManageStudentTutor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "end_date",
                table: "manage_student_tutors",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_manage_student_tutors_student_id",
                table: "manage_student_tutors",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_manage_student_tutors_tutor_id",
                table: "manage_student_tutors",
                column: "tutor_id");

            migrationBuilder.AddForeignKey(
                name: "fk_manage_student_tutors_application_user_student_id",
                table: "manage_student_tutors",
                column: "student_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_manage_student_tutors_application_user_tutor_id",
                table: "manage_student_tutors",
                column: "tutor_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_manage_student_tutors_application_user_student_id",
                table: "manage_student_tutors");

            migrationBuilder.DropForeignKey(
                name: "fk_manage_student_tutors_application_user_tutor_id",
                table: "manage_student_tutors");

            migrationBuilder.DropIndex(
                name: "ix_manage_student_tutors_student_id",
                table: "manage_student_tutors");

            migrationBuilder.DropIndex(
                name: "ix_manage_student_tutors_tutor_id",
                table: "manage_student_tutors");

            migrationBuilder.DropColumn(
                name: "end_date",
                table: "manage_student_tutors");
        }
    }
}
