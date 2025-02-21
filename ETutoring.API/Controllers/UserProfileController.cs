using ETutoring.Business.Dtos.Auth;
using ETutoring.Business.Interfaces;
using ETutoring.Core.Entities;
using ETutoring.DataAccess.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ETutoring.API.Controllers
{
    [Route("api/users")]
    [ApiController]
    [Authorize]
    public class UserProfileController : ControllerBase
    {
        private readonly IUserProfileService _userProfileService;
        private readonly UserManager<ApplicationUser> _userManager;

        public UserProfileController(IUserProfileService userProfileService, UserManager<ApplicationUser> userManager)
        {
            _userProfileService = userProfileService;
            _userManager = userManager;
        }

        [HttpPost("profile")]
        public async Task<IActionResult> GetUserProfile([FromBody] UserProfileRequest model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userProfileService.GetUserProfileAsync(model.Id, model);

            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(new UserProfileResponse
            {
                Id = user.Id,
                FullName = user.FullName,
                DateOfBirth = user.DateOfBirth,
                Gender = user.Gender,
                Address = user.Address,
                PhoneNumber = user.PhoneNumber,
                ProfilePicture = user.ProfilePicture,
                Nationality = user.Nationality,
                IdentificationNumber = user.IdentificationNumber,
                IsEmailConfirmed = user.IsEmailConfirmed,
                IsPhoneConfirmed = user.IsPhoneConfirmed,
                IsActive = user.IsActive,
                LastLoginTime = user.LastLoginTime
            });
        }



        [HttpPost("update-profile")]
        public async Task<IActionResult> UpdateUserProfile([FromBody] UpdateProfileRequest model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var parsedUserId))
                return Unauthorized(new { message = "Invalid user token." });

            var updatedUser = await _userProfileService.UpdateUserProfileAsync(parsedUserId, model);
            if (updatedUser == null)
                return NotFound(new { message = "User not found" });

            return Ok(new { message = "Profile updated successfully" });
        }

    }
}
