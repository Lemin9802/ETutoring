using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ETutoring.Business.Dtos.Response;
using ETutoring.Business.Dtos.Response.Moderator;
using ETutoring.Business.Dtos.Response.Students;
using ETutoring.Core.Common;
using ETutoring.Core.Entities;

namespace ETutoring.Business.Interfaces.Students
{
    public interface IStudentService
    {
        Task<ApiResponse<List<GetTutorForStudentResponse>>> GetTutorsForStudentAsync(Guid studentId);
        Task<ApiResponse<List<UnassignedStudentResponse>>> GetUnassignedStudentsAsync();
        Task<ApiResponse<List<InactiveStudentResponse>>> GetInactiveStudentsAsync(int days);
        Task<byte[]> GenerateUnassignedStudentsPdfReportAsync();
        Task<byte[]> GenerateUnassignedStudentsExcelReportAsync();
        Task<byte[]> GenerateInactiveStudentsPdfReportAsync(int days);
        Task<byte[]> GenerateInactiveStudentsExcelReportAsync(int days);
    }
}
