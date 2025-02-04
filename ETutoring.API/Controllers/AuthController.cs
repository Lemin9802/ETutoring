using ETutoring.Business.Dtos.Auth;
using ETutoring.Business.Interfaces;
using ETutoring.Core.Common;
using ETutoring.Core.Helpers;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using LoginRequest = ETutoring.Business.Dtos.Auth.LoginRequest;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ETutoring.API.Controllers;

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
    public async Task<ActionResult<TokenResponse>> Login([FromBody] LoginRequest model)
    {
        try
        {
            var result = await _identityServices.LoginAsync(model);

            if (result.IsSuccess)
            {
                return Ok(ApiResponseHandler.SuccessResponse(result.Data));
            }

            return BadRequest(
                ApiResponseHandler.FailureResponse<TokenResponse>("Error while login, checkout errors for details",
                    result.Errors));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHandler.FailureResponse<string>("An error has occured"));
        }
    }

    [HttpPost("register")]
    public async Task<ActionResult<Guid>> Register([FromBody] RegisterRequest request)
    {
        var result = await _identityServices.CreateUserAsync(request.Email, request.Password);

        if (result.IsSuccess)
        {
            return Ok(ApiResponseHandler.SuccessResponse<object>(result.Data, "User Created Successfully"));
        }

        return BadRequest(ApiResponseHandler.FailureResponse<Guid>("Cannot Register", result.Errors));
    }

    // POST api/<AuthController>
    [HttpPost("refresh-token")]
    public async Task<ActionResult<TokenResponse>> RefreshToken([FromBody] string refreshToken)
    {
        try
        {
            var result = await _identityServices.RefreshTokenAsync(refreshToken);
            if (result.IsSuccess)
            {
                return Ok(ApiResponseHandler.SuccessResponse(result.Data));
            }

            return BadRequest(
                ApiResponseHandler.FailureResponse<TokenResponse>("Invalid Refresh Token", result.Errors));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHandler.FailureResponse<string>("An error has occurred"));
        }
    }

    // POST api/auth/login-google
    [HttpPost("sync-google-user")]
    public async Task<ActionResult<ApiResponse<TokenResponse>>> SyncGoogleUser([FromBody] GoogleUserRequest request)
    {
        try
        {
            var result = await _identityServices.SyncGoogleUserAsync(request);

            if (!result.IsSuccess)
            {
                return BadRequest(ApiResponseHandler.FailureResponse<TokenResponse>(
                    "Error while syncing google user, checkout errors for details", result.Errors));
            }

            return Ok(ApiResponseHandler.SuccessResponse(result.Data, "Google user synced successfully."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHandler.FailureResponse<string>("An error has occurred", [ex.Message]));
        }
    }
}