using ETutoring.Business.Dtos.Meetings;
using ETutoring.Core.Entities;

namespace ETutoring.Business.Mappers;

public static class MeetingMappers
{
    public static Meeting ToCreateMeeting(this CreateMeetingDto dto)
    {
        var meeting = new Meeting(dto.Title, dto.Description, dto.StartTime, dto.EndTime, dto.CreatorId);

        foreach (var userId in dto.Participants)
        {
            meeting.AddAttendee(userId);
        }

        return meeting;
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
            Participants = meeting.Attendees
                .Select(a => new MeetingParticipantDto
                {
                    FullName = a.User.FullName,
                    Email = a.User.Email!
                })
                .ToList(),
            Status = meeting.Status
        };
    }
}