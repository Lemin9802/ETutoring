using ETutoring.Business.Dtos.Auth;
using ETutoring.Business.Interfaces;
using ETutoring.Business.Interfaces.Services;
using ETutoring.Business.Interfaces.Students;
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
        private readonly IIdentityServices _identityServices;

        public UsersController( IIdentityServices identityServices)
        {
            _identityServices = identityServices;
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

            return BadRequest(ApiResponseHandler.FailureResponse<string>("Failed to assign role.", result.Errors));
        }
    }
}
