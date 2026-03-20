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

    public MeetingStatus Status { get; private set; } = MeetingStatus.Pending;

    public ApplicationUser Creator { get; set; }

    public ICollection<MeetingAttendee> Attendees { get; private set; } = new List<MeetingAttendee>();

    public Meeting(string title, string? description, DateTime startTime, DateTime endTime, Guid creatorId)
    {
        Title = title;
        Description = description;
        StartTime = startTime;
        EndTime = endTime;
        CreatorId = creatorId;
    }

    public void ChangeMeetingStatus(MeetingStatus status)
    {
        Status = status;
    }

    public void AddAttendee(Guid userId)
    {
        if (!Attendees.Any(a => a.UserId == userId))
        {
            Attendees.Add(new MeetingAttendee(userId, this.Id));
        }
    }

    public void RemoveAttendee(Guid userId)
    {
        var attendee = Attendees.FirstOrDefault(a => a.UserId == userId);
        if (attendee != null)
        {
            Attendees.Remove(attendee);
        }
    }
}