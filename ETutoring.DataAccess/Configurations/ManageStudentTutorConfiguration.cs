using ETutoring.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ETutoring.DataAccess.Configurations;

public class ManageStudentTutorConfiguration : IEntityTypeConfiguration<ManageStudentTutor>
{
    public void Configure(EntityTypeBuilder<ManageStudentTutor> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.Student)
            .WithMany()
            .HasForeignKey(x => x.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Tutor)
            .WithMany()
            .HasForeignKey(x => x.TutorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.AssignedAt)
            .IsRequired();
    }
} 