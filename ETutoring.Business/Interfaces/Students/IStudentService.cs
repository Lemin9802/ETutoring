using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ETutoring.Business.Dtos.Students;
using ETutoring.Core.Entities;

namespace ETutoring.Business.Interfaces.Students
{
    public interface IStudentService
    {
        Task<List<StudentTutorResponse>> GetTutorsForStudentAsync(Guid studentId);
    }
}
