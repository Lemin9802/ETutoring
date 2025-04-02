using ETutoring.Core.Enums;

namespace ETutoring.Business.Dtos.Meetings;

public record MeetingResponse
{
    public Guid Id { get; init; }

    public string Title { get; init; }

    public string? Description { get; init; }

    public DateTime StartTime { get; init; }

    public DateTime EndTime { get; init; }

    public Guid CreatorId { get; init; }

    public List<MeetingParticipantDto> Participants { get; init; } = new();

    public MeetingStatus Status { get; init; }
}

public record MeetingParticipantDto
{
    public string FullName { get; init; }

    public string Email { get; init; }
}
