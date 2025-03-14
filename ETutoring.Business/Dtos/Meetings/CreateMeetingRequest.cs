namespace ETutoring.Business.Dtos.Meetings;

public record CreateMeetingRequest
{
    public required string Title { get; init; }

    public string? Description { get; init; }

    public required DateTime StartTime { get; init; }

    public required DateTime EndTime { get; init; }

    public Guid CreatorId { get; private set; }

    public required Guid ReceiverId { get; init; }

    public void AddCreator(Guid id)
    {
        CreatorId = id;
    }
}