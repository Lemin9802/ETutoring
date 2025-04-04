using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Documents
{
    public class GetDocumentsByUploaderIdRequest
    {
        public Guid UploaderId { get; set; }
        public Guid TutorId { get; set; }
    }
}
