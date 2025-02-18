namespace ETutoring.Business.Dtos.Blogs;

public record CreateBlogRequest
{
    public string Title { get; set; }
    public string Content { get; set; }
    public Guid UserId { get; set; }
}