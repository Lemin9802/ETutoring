namespace ETutoring.Business.Dtos;

public record MetaRequest
{
    public int PageNumber { get; init; }

    public int PageSize { get; init; }
}