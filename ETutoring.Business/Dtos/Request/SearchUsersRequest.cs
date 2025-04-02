namespace ETutoring.Business.Dtos.Request;

public record SearchUsersRequest
{
    public string Search { get; init; }

    public int PageNumber { get; init; }

    public int PageSize { get; init; }
}