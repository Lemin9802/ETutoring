using ETutoring.Business.Dtos.Students;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Interfaces.Tutor
{
    public interface ITutorService
    {
        Task<List<StudentTutorResponse>> GetStudentsForTutorAsync(Guid tutorId);
    }
}
