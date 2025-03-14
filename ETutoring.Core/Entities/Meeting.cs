using ETutoring.Core.Common;
using ETutoring.Core.Enums;

namespace ETutoring.Core.Entities;

public class Meeting : BaseEntity
{
    public string Title { get; private set; }

    public string? Description { get; private set; }

    public DateTime StartTime { get; private set; }

    public DateTime EndTime { get; private set; }

    public Guid CreatorId { get; private set; }

    public Guid ReceiverId { get; private set; }

    public MeetingStatus Status { get; private set; } = MeetingStatus.Pending;

    public ApplicationUser Student { get; set; } = new();

    public ApplicationUser Tutor { get; set; } = new();

    public Meeting(string title, string? description, DateTime startTime, DateTime endTime, Guid creatorId, Guid receiverId)
    {
        Title = title;
        Description = description;
        StartTime = startTime;
        EndTime = endTime;
        CreatorId = creatorId;
        ReceiverId = receiverId;
    }

    public void ChangeMeetingStatus(MeetingStatus status)
    {
        Status = status;
    }
}