using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Blogs
{
    public record UpdateBlogRequest
    {
        public string Title { get; set; }
        public string Content { get; set; }
    }
}
