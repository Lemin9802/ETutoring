namespace ETutoring.Business.Dtos.Auth;

public record AssignRoleRequest
{
    public Guid UserId { get; init; }

    public Guid RoleId { get; init; }
}