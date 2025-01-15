using ETutoring.Business.Dtos.Auth;
using ETutoring.Business.Interfaces;
using ETutoring.Core.Helpers;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ETutoring.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IIdentityServices _identityServices;

        public AuthController(IIdentityServices identityServices)
        {
            _identityServices = identityServices;
        }

        // POST api/<AuthController>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            try
            {
                var result = await _identityServices.LoginAsync(model);

                if (result.IsSuccess)
                {
                    return Ok(ApiResponseHandler.SuccessResponse(result.Data));
                }
                return BadRequest(ApiResponseHandler.FailureResponse<string>("An error has occurred"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponseHandler.FailureResponse<string>("An error has occured"));
            }
        }

        // POST api/<AuthController>
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] string refreshToken)
        {
            try
            {
                var result = await _identityServices.RefreshTokenAsync(refreshToken);
                if (result.IsSuccess)
                {
                    return Ok(ApiResponseHandler.SuccessResponse(result.Data));
                }

                return BadRequest(ApiResponseHandler.FailureResponse<string>("Invalid Refresh Token"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponseHandler.FailureResponse<string>("An error has occurred"));
            }
        }
    }
}
