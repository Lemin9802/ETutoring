using ETutoring.Core.Common;

namespace ETutoring.Core.Entities;

public class Blog : BaseEntity
{
    public string Title { get; set; }
    public string Content { get; set; }
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; }
    public ICollection<BlogLike> Likes { get; set; } = new List<BlogLike>();

    //public ICollection<Comment> Comments { get; set; }
}