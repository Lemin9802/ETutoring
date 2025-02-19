using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ETutoring.Business.Dtos.Students;
using ETutoring.Core.Entities;

namespace ETutoring.Business.Interfaces
{
    public interface IStudentService
    {
        Task<List<ApplicationUser>> GetStudentsByTutorIdAsync(Guid tutorId);
        Task<List<StudentTutorStatusResponse>> GetAllStudentsWithTutorStatusAsync();
        Task<bool> AssignTutorToStudentAsync(Guid studentId, Guid tutorId, Guid assignedBy);
    }
}
