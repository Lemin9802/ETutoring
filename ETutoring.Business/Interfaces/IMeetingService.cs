using ETutoring.Business.Dtos.Meetings;

namespace ETutoring.Business.Interfaces;

public interface IMeetingService
{
    Task<CreateMeetingRequest> CreateMeetingAsync(CreateMeetingRequest meeting, CancellationToken cancellationToken);
    Task<IEnumerable<MeetingResponse>> GetUserMeetings(Guid userId, CancellationToken cancellationToken);
    Task<bool> ChangeMeetingStatus(ChangeMeetingStatusRequest request, CancellationToken cancellationToken);
    Task<IEnumerable<MeetingResponse>> GetAllMeetings(CancellationToken cancellationToken);
}