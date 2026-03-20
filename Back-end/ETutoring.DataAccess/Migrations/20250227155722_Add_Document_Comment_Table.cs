using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ETutoring.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class Add_Document_Comment_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "document_comments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    document_id = table.Column<Guid>(type: "uuid", nullable: false),
                    commenter_id = table.Column<Guid>(type: "uuid", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    parent_comment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_document_comments", x => x.id);
                    table.ForeignKey(
                        name: "fk_document_comments_application_user_commenter_id",
                        column: x => x.commenter_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_document_comments_document_comments_parent_comment_id",
                        column: x => x.parent_comment_id,
                        principalTable: "document_comments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_document_comments_documents_document_id",
                        column: x => x.document_id,
                        principalTable: "documents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_document_comments_commenter_id",
                table: "document_comments",
                column: "commenter_id");

            migrationBuilder.CreateIndex(
                name: "ix_document_comments_document_id",
                table: "document_comments",
                column: "document_id");

            migrationBuilder.CreateIndex(
                name: "ix_document_comments_parent_comment_id",
                table: "document_comments",
                column: "parent_comment_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "document_comments");
        }
    }
}
