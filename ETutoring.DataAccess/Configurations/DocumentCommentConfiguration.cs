using ETutoring.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ETutoring.DataAccess.Configurations;

public class DocumentCommentConfiguration : IEntityTypeConfiguration<DocumentComment>
{
    public void Configure(EntityTypeBuilder<DocumentComment> builder)
    {
        builder.HasOne(dc => dc.Document)
            .WithMany(d => d.Comments)
            .HasForeignKey(dc => dc.DocumentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(dc => dc.Commenter)
            .WithMany()
            .HasForeignKey(dc => dc.CommenterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(dc => dc.ParentComment)
            .WithMany(dc => dc.Replies)
            .HasForeignKey(dc => dc.ParentCommentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure properties
        builder.Property(dc => dc.Content)
            .IsRequired();

        builder.HasIndex(dc => dc.DocumentId);
        builder.HasIndex(dc => dc.CommenterId);
        builder.HasIndex(dc => dc.ParentCommentId);
    }
}