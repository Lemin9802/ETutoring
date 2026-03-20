namespace ETutoring.Business.Interfaces.Services;

public interface IUserService
{
    Task<IEnumerable<string?>> SearchUsersAsync(string query, CancellationToken cancellationToken);
}