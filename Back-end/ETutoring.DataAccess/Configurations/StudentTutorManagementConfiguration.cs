using ETutoring.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ETutoring.DataAccess.Configurations;

public class StudentTutorManagementConfiguration : IEntityTypeConfiguration<StudentTutorManagement>
{
    public void Configure(EntityTypeBuilder<StudentTutorManagement> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne<StudentTutorManagementHistory>()
            .WithMany()
            .HasForeignKey("StudentTutorManagementId") // Assuming this is the correct foreign key
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.AssignedAt)
            .IsRequired();
    }
}
