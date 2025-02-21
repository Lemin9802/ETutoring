using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ETutoring.Business.Dtos.Response;
using ETutoring.Business.Dtos.Response.Moderator;
using ETutoring.Core.Entities;

namespace ETutoring.Business.Interfaces.Students
{
    public interface IStudentService
    {
        Task<BaseResponse> GetTutorsForStudentAsync(Guid studentId);
    }
}
