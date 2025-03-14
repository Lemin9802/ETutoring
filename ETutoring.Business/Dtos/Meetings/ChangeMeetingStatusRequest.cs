using ETutoring.Core.Enums;

namespace ETutoring.Business.Dtos.Meetings;

public record ChangeMeetingStatusRequest
{
    public Guid MeetingId { get; init; }
    public MeetingStatus Status { get; init; }
    public bool IsTutor { get; private set; }

    public void SetIsTutor(bool isTutor)
    {
        IsTutor = isTutor;
    }
}