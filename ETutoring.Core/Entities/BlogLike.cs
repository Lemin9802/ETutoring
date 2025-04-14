using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ETutoring.Core.Common;

namespace ETutoring.Core.Entities
{
    public class BlogLike
    {
        public Guid BlogId { get; set; }
        public Blog Blog { get; set; }
        public Guid UserId { get; set; }
        public ApplicationUser User { get; set; }
    }
}

