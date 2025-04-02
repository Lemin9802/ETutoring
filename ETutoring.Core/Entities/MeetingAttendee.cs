namespace ETutoring.Core.Entities;

public class MeetingAttendee
{
    public Guid MeetingId { get; private set; }
    public Meeting Meeting { get; private set; }

    public Guid UserId { get; private set; }
    public ApplicationUser User { get; private set; }

    public MeetingAttendee(Guid userId, Guid meetingId)
    {
        UserId = userId;
        MeetingId = meetingId;
    }

    // EF Core needs a parameterless constructor
    private MeetingAttendee() { }
}
