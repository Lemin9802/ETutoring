using ETutoring.Business.Dtos.Auth;
using ETutoring.Business.Interfaces;
using ETutoring.Business.Interfaces.Services;
using ETutoring.Core.Common;
using ETutoring.Core.Entities;
using ETutoring.Core.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ETutoring.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IStudentService _studentService;
        private readonly IIdentityServices _identityServices;

        public UsersController(IStudentService studentService, IIdentityServices identityServices)
        {
            _studentService = studentService;
            _identityServices = identityServices;
        }

        [HttpGet("tutor/{tutorId}/students")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<List<ApplicationUser>>>> GetStudentsByTutor(Guid tutorId)
        {
            var students = await _studentService.GetStudentsByTutorIdAsync(tutorId);
            if (students == null || students.Count == 0)
            {
                return NotFound(ApiResponseHandler.FailureResponse<List<ApplicationUser>>(
                    "No students found for this tutor."));
            }

            return Ok(ApiResponseHandler.SuccessResponse(students, "Students retrieved successfully."));
        }

        [HttpPost("assign-role")]
        [Authorize(Roles = Constants.ADMIN_ROLE)]
        public async Task<ActionResult<ApiResponse<string>>> AssignRole([FromBody] AssignRoleRequest request)
        {
            var result = await _identityServices.AssignRoleAsync(request.UserId, request.RoleId);

            if (result.IsSuccess)
            {
                return Ok(ApiResponseHandler.SuccessResponse(result.Data, "Role assigned successfully."));
            }

            return BadRequest(ApiResponseHandler.FailureResponse<string>("Cannot assign role", result.Errors));
        }
    }
}
