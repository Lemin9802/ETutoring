using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Blogs;
public record DeleteBlogRequest
{
    public Guid BlogId { get; set; }
}

