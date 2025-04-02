using ETutoring.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ETutoring.DataAccess.Configurations;

public class MeetingConfiguration : IEntityTypeConfiguration<Meeting>
{
    public void Configure(EntityTypeBuilder<Meeting> builder)
    {
        builder.Property(m => m.Title)
            .IsRequired();

        builder.Property(m => m.Description)
            .HasMaxLength(1000)
            .IsRequired(false);

        builder.Property(m => m.StartTime)
            .IsRequired();

        builder.Property(m => m.EndTime)
            .IsRequired();

        builder.Property(m => m.Status)
            .HasComment("0: Pending, 1: Accepted, 2: Rejected")
            .IsRequired();

        builder.HasOne(m => m.Creator)
            .WithMany()
            .HasForeignKey(m => m.CreatorId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure many-to-many via MeetingAttendee
        builder
            .HasMany(m => m.Attendees)
            .WithOne(a => a.Meeting)
            .HasForeignKey(a => a.MeetingId);
    }
}