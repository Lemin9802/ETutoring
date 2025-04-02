using ETutoring.Business.Dtos.Meetings;
using ETutoring.Business.Exceptions;
using ETutoring.Business.Interfaces;
using ETutoring.Business.Mappers;
using Microsoft.EntityFrameworkCore;

namespace ETutoring.Business.Services;

public class MeetingService : IMeetingService
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityServices _identityServices;

    public MeetingService(IApplicationDbContext context, IIdentityServices identityServices)
    {
        _context = context;
        _identityServices = identityServices;
    }

    public async Task<CreateMeetingRequest> CreateMeetingAsync(CreateMeetingRequest meeting, CancellationToken cancellationToken)
    {
        var users = await _identityServices.FindUsersByEmailsAsync(meeting.Participants, cancellationToken);

        if (users == null || users.Count == 0)
            throw new Exception("No valid participants found.");

        var dto = new CreateMeetingDto
        {
            Title = meeting.Title,
            Description = meeting.Description,
            StartTime = meeting.StartTime,
            EndTime = meeting.EndTime,
            CreatorId = meeting.CreatorId,
            Participants = users
        };

        var newMeeting = dto.ToCreateMeeting();

        await _context.Meetings.AddAsync(newMeeting, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return meeting;
    }


    public async Task<IEnumerable<MeetingResponse>> GetUserMeetings(Guid userId, CancellationToken cancellationToken)
    {
        var meetings = await _context.Meetings
            .Where(m =>
                m.CreatorId == userId ||
                m.Attendees.Any(a => a.UserId == userId))
            .ToListAsync(cancellationToken);

        return meetings.Select(m => m.ToMeetingDto());
    }


    public async Task<bool> ChangeMeetingStatus(ChangeMeetingStatusRequest request, CancellationToken cancellationToken)
    {
        if (request.IsTutor) throw new DeclineMeetingException();

        var meeting = await _context.Meetings.FirstOrDefaultAsync(m => m.Id == request.MeetingId, cancellationToken);
        if (meeting is null) throw new EntityNotFoundException("Meeting", request.MeetingId);

        meeting.ChangeMeetingStatus(request.Status);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }


    public async Task<IEnumerable<MeetingResponse>> GetAllMeetings(CancellationToken cancellationToken)
    {
        var meetings = await _context.Meetings
            .Include(m => m.Attendees)
            .ThenInclude(a => a.User)
            .ToListAsync(cancellationToken);

        return meetings.Select(m => m.ToMeetingDto());
    }
}