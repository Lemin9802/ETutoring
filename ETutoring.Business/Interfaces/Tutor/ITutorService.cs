using ETutoring.Business.Dtos.Response.Moderator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ETutoring.Business.Dtos.Response;
using ETutoring.Business.Dtos.Response.Tutor;
using ETutoring.Core.Common;

namespace ETutoring.Business.Interfaces.Tutor
{
    public interface ITutorService
    {
        Task<ApiResponse<List<GetStudentsForTutorResponse>>> GetStudentsForTutorAsync(Guid tutorId, int page, int size);
    }
}
