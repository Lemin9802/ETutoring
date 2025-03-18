using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ETutoring.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddStudentTutorManagementIdToHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_student_tutor_management_histories_student_tutor_management",
                table: "student_tutor_management_histories");

            migrationBuilder.DropIndex(
                name: "ix_student_tutor_management_histories_student_tutor_management",
                table: "student_tutor_management_histories");

            migrationBuilder.RenameColumn(
                name: "student_tutor_management_id",
                table: "student_tutor_management_histories",
                newName: "StudentTutorManagementId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "StudentTutorManagementId",
                table: "student_tutor_management_histories",
                newName: "student_tutor_management_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_tutor_management_histories_student_tutor_management",
                table: "student_tutor_management_histories",
                column: "student_tutor_management_id");

            migrationBuilder.AddForeignKey(
                name: "fk_student_tutor_management_histories_student_tutor_management",
                table: "student_tutor_management_histories",
                column: "student_tutor_management_id",
                principalTable: "student_tutor_managements",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
