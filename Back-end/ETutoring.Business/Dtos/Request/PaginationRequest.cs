using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Request
{
    public class PaginationRequest
    {
        public int Page { get; set; }
        public int Size { get; set; }
    }

}
