using ETutoring.Core.Entities;
using ETutoring.Core.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ETutoring.DataAccess.Configurations;

public class DocumentConfiguration : IEntityTypeConfiguration<Document>
{
    public void Configure(EntityTypeBuilder<Document> builder)
    {
        builder.HasOne(d => d.Uploader)
            .WithMany(u => u.UploadedDocuments)
            .HasForeignKey(d => d.UploaderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(d => d.Tutor)
            .WithMany(u => u.ReceivedDocuments)
            .HasForeignKey(d => d.TutorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(d => d.FileUrl)
            .IsRequired();

        // Add unique constraint for FileUrl
        builder.HasIndex(d => d.FileUrl)
            .IsUnique();

        builder.Property(d => d.FileName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(d => d.Description)
            .HasMaxLength(255);

        builder.Property(d => d.Status)
            .HasDefaultValue(DocumentStatus.PendingReview)
            .HasConversion<int>()
            .IsRequired();

        builder.HasIndex(d => d.FileName);

        builder.HasIndex(d => new { d.UploaderId, d.TutorId, d.FileName });
    }
}