using ETutoring.Business.Dtos.Auth;
using ETutoring.Business.Interfaces;
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
            var result = await _identityServices.LoginAsync(model);

            if (result.IsSuccess)
            {
                return Ok(result.Data);
            }
            return BadRequest(result.Errors);
        }
    }
}
