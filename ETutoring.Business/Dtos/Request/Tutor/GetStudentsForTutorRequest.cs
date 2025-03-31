using ETutoring.Core.Common;
using Newtonsoft.Json;

namespace ETutoring.Business.Dtos.Request.Tutor;

public class GetStudentsForTutorRequest
{
    [JsonIgnore]
    public Guid TutorId { get; set; }

    public string Search { get; init; }

    public Filter? Filters { get; init; }

    public MetaDataResponse Meta { get; init; }
}

public record Filter
{
    public string? Status { get; init; }

    public DateTime[]? LoginDateRange { get; init; }
}