using ETutoring.Core.Common;

namespace ETutoring.Core.Entities;

public class Comment : BaseEntity
{
    public string Content { get; set; }
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; }
    public ICollection<BlogComment> BlogComments { get; set; }
}
