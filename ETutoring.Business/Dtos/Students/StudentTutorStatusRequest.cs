using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Students
{
    public class GetStudentTutorStatusRequest
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool HasTutor { get; set; }

        public GetStudentTutorStatusRequest() { }

        public GetStudentTutorStatusRequest(Guid id, string name, bool hasTutor)
        {
            Id = id;
            Name = name;
            HasTutor = hasTutor;
        }
    }
}
