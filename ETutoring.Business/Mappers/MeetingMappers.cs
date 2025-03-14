using ETutoring.Business.Dtos.Meetings;
using ETutoring.Core.Entities;

namespace ETutoring.Business.Mappers;

public static class MeetingMappers
{
    public static Meeting ToCreateMeeting(this CreateMeetingRequest dto)
    {
        return new Meeting(dto.Title, dto.Description, dto.StartTime, dto.EndTime, dto.CreatorId, dto.ReceiverId);
    }

    public static MeetingResponse ToMeetingDto(this Meeting meeting)
    {
        return new MeetingResponse
        {
            Id = meeting.Id,
            Title = meeting.Title,
            Description = meeting.Description,
            StartTime = meeting.StartTime,
            EndTime = meeting.EndTime,
            CreatorId = meeting.CreatorId,
            ReceiverId = meeting.ReceiverId
        };
    }
}