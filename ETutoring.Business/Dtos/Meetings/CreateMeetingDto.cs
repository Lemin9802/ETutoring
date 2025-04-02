namespace ETutoring.Business.Dtos.Meetings;

public class CreateMeetingDto
{
    public required string Title { get; init; }

    public string? Description { get; init; }

    public required DateTime StartTime { get; init; }

    public required DateTime EndTime { get; init; }

    public Guid CreatorId { get; init; }

    public List<Guid> Participants { get; init; }
}