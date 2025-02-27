using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Blogs
{
    public class CreateCommentRequest
    {
        public Guid BlogId {  get; set; }
        public Guid UserId { get; set; }
        public string Content { get; set; }
    }
}
