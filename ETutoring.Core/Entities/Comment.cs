using ETutoring.Core.Common;
using System.Text.Json.Serialization;

namespace ETutoring.Core.Entities;

public class Comment : BaseEntity
{
    public string Content { get; set; }
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; }

    [JsonIgnore]
    public ICollection<BlogComment> BlogComments { get; set; }
}
