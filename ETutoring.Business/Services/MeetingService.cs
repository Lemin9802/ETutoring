using ETutoring.Business.Dtos.Meetings;
using ETutoring.Business.Exceptions;
using ETutoring.Business.Interfaces;
using ETutoring.Business.Mappers;
using Microsoft.EntityFrameworkCore;

namespace ETutoring.Business.Services;

public class MeetingService : IMeetingService
{
    private readonly IApplicationDbContext _context;

    public MeetingService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CreateMeetingRequest> CreateMeetingAsync(CreateMeetingRequest meeting, CancellationToken cancellationToken)
    {
        var newMeeting = meeting.ToCreateMeeting();
        await _context.Meetings.AddAsync(newMeeting, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        return meeting;
    }

    public async Task<IEnumerable<MeetingResponse>> GetUserMeetings(Guid userId, CancellationToken cancellationToken)
    {
        var meetings = await _context.Meetings
            .Where(m => m.CreatorId == userId || m.ReceiverId == userId)
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
}