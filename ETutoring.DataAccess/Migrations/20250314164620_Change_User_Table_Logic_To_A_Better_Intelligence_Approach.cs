using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ETutoring.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class Change_User_Table_Logic_To_A_Better_Intelligence_Approach : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_blogs_application_user_user_id",
                table: "blogs");

            migrationBuilder.DropForeignKey(
                name: "fk_comments_application_user_user_id",
                table: "comments");

            migrationBuilder.DropForeignKey(
                name: "fk_document_comments_application_user_commenter_id",
                table: "document_comments");

            migrationBuilder.DropForeignKey(
                name: "fk_email_sent_application_user_user_id",
                table: "email_sent");

            migrationBuilder.DropForeignKey(
                name: "fk_meetings_application_user_creator_id",
                table: "meetings");

            migrationBuilder.DropForeignKey(
                name: "fk_meetings_application_user_receiver_id",
                table: "meetings");

            migrationBuilder.DropForeignKey(
                name: "fk_refresh_tokens_application_user_user_id",
                table: "refresh_tokens");

            migrationBuilder.AddForeignKey(
                name: "fk_blogs_users_user_id",
                table: "blogs",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_comments_users_user_id",
                table: "comments",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_document_comments_users_commenter_id",
                table: "document_comments",
                column: "commenter_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_email_sent_users_user_id",
                table: "email_sent",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_meetings_users_creator_id",
                table: "meetings",
                column: "creator_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_meetings_users_receiver_id",
                table: "meetings",
                column: "receiver_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_refresh_tokens_users_user_id",
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
                name: "fk_blogs_users_user_id",
                table: "blogs");

            migrationBuilder.DropForeignKey(
                name: "fk_comments_users_user_id",
                table: "comments");

            migrationBuilder.DropForeignKey(
                name: "fk_document_comments_users_commenter_id",
                table: "document_comments");

            migrationBuilder.DropForeignKey(
                name: "fk_email_sent_users_user_id",
                table: "email_sent");

            migrationBuilder.DropForeignKey(
                name: "fk_meetings_users_creator_id",
                table: "meetings");

            migrationBuilder.DropForeignKey(
                name: "fk_meetings_users_receiver_id",
                table: "meetings");

            migrationBuilder.DropForeignKey(
                name: "fk_refresh_tokens_users_user_id",
                table: "refresh_tokens");

            migrationBuilder.AddForeignKey(
                name: "fk_blogs_application_user_user_id",
                table: "blogs",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_comments_application_user_user_id",
                table: "comments",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_document_comments_application_user_commenter_id",
                table: "document_comments",
                column: "commenter_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_email_sent_application_user_user_id",
                table: "email_sent",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_meetings_application_user_creator_id",
                table: "meetings",
                column: "creator_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_meetings_application_user_receiver_id",
                table: "meetings",
                column: "receiver_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_refresh_tokens_application_user_user_id",
                table: "refresh_tokens",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
