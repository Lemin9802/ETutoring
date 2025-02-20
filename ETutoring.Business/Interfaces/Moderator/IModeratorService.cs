using ETutoring.Business.Dtos.Students;
using ETutoring.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Interfaces.Moderator
{
    public interface IModeratorService
    {
        Task<List<StudentTutorStatusResponse>> GetAllStudentsAsync(bool? hasTutor);
        Task<bool> AssignTutorToStudentAsync(Guid studentId, Guid tutorId, Guid assignedBy);
        Task<List<StudentTutorManagementHistoryResponse>> GetManagementHistoryAsync();
        Task<List<StudentTutorManagementHistoryResponse>> GetManagementHistoryAsync(Guid studentTutorManagementId);

    }
}
