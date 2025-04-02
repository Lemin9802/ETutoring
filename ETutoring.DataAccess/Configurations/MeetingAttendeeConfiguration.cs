using ETutoring.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ETutoring.DataAccess.Configurations;

public class MeetingAttendeeConfiguration : IEntityTypeConfiguration<MeetingAttendee>
{
    public void Configure(EntityTypeBuilder<MeetingAttendee> builder)
    {
        builder.HasKey(ma => new { ma.MeetingId, ma.UserId });

        builder.HasOne(ma => ma.Meeting)
            .WithMany(m => m.Attendees)
            .HasForeignKey(ma => ma.MeetingId);

        builder.HasOne(ma => ma.User)
            .WithMany(u => u.Meetings)
            .HasForeignKey(ma => ma.UserId);
    }
}
