using ETutoring.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ETutoring.DataAccess.Configurations;

public class EmailSentConfiguration : IEntityTypeConfiguration<EmailSent>
{
    public void Configure(EntityTypeBuilder<EmailSent> builder)
    {
        builder.Property(e => e.Subject)
            .IsRequired();

        builder.Property(e => e.Body)
            .HasColumnType("Text")
            .IsRequired();

        builder.Property(e => e.EmailType)
            .IsRequired();

        builder.Property(e => e.Status)
            .HasConversion<int>()
            .HasComment("0 is Sent, 1 is Read")
            .IsRequired();

        builder.Property(e => e.Subject)
            .IsRequired();

        builder.HasOne(e => e.User)
            .WithMany(u => u.EmailNotifications)
            .HasForeignKey(e => e.UserId)
            .IsRequired();
    }
}