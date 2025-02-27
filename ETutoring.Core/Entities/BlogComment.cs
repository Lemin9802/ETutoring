namespace ETutoring.Core.Entities
{
    public class BlogComment
    {
        public Guid BlogId { get; set; }
        public Blog Blog { get; set; }

        public Guid CommentId { get; set; }
        public Comment Comment { get; set; }
    }

}
