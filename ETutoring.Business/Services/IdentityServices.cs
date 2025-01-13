using ETutoring.Business.Dtos.Auth;
using ETutoring.Business.Interfaces;
using ETutoring.Core.Utilities;
using ETutoring.DataAccess.Entities;
using Microsoft.AspNetCore.Identity;

namespace ETutoring.Business.Services;

public class IdentityServices : IIdentityServices
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;

    public IdentityServices(UserManager<ApplicationUser> userManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    public async Task<ServiceResult<(string AccessToken, string RefreshToken)>> LoginAsync(LoginDto model)
    {
        // Find the user by email
        var user = await _userManager.FindByEmailAsync(model.Email);

        if (user == null)
        {
            return ServiceResult<(string, string)>.Failure("Invalid username or password.");
        }

        // Check if the password is correct
        var isPasswordValid = await _userManager.CheckPasswordAsync(user, model.Password);
        if (!isPasswordValid)
        {
            return ServiceResult<(string, string)>.Failure("Invalid username or password.");
        }

        // Generate Access Token
        var accessToken = await _tokenService.GenerateToken(user);

        // Generate a new Refresh Token and set expiry time
        var refreshToken = _tokenService.GenerateRefreshToken();
        var refreshTokenExpiryTime = DateTime.UtcNow.AddMonths(1);

        // Update user's Refresh Token and Expiry
        user.SetRefreshToken(refreshToken, refreshTokenExpiryTime);

        // Save changes to the database
        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            return ServiceResult<(string, string)>.Failure("Failed to update refresh token.");
        }

        // Return success result with tokens
        return ServiceResult<(string, string)>.Success((accessToken, refreshToken));
    }

}