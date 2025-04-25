using ETutoring.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ETutoring.DataAccess.Configurations;

public class MessageConfiguration : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        builder
            .Property(m => m.SenderId)
            .HasColumnType("uuid");

        builder
            .Property(m => m.ReceiverId)
            .HasColumnType("uuid");
    }
}