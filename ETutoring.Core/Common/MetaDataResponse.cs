namespace ETutoring.Core.Common;

public record MetaDataResponse
{
    public int PageNumber { get; init; }

    public int PageSize { get; init; }

    public int TotalPages { get; init; }

    public int TotalItems { get; init; }

    public MetaDataResponse(int pageNumber, int pageSize, int totalPages, int totalItems)
    {
        PageNumber = pageNumber;
        PageSize = pageSize;
        TotalPages = totalPages;
        TotalItems = totalItems;
    }
}