using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Blogs
{
    public class LikeBlogRequest
    {
        [JsonPropertyName("blogId")]
        public Guid BlogId { get; set; }
        [JsonPropertyName("userId")]
        public Guid UserId { get; set; }
    }
}

