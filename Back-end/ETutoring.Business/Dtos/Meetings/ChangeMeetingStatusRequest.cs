using ETutoring.Core.Enums;

namespace ETutoring.Business.Dtos.Meetings;

public record ChangeMeetingStatusRequest
{
    public Guid MeetingId { get; init; }
    public MeetingStatus Status { get; init; }
}