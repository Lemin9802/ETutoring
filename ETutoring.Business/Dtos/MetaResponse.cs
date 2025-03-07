namespace ETutoring.Business.Dtos;

public record MetaResponse
{
    public int PageNumber { get; init; }

    public int PageSize { get; init; }
}