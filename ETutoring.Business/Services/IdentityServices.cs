using ETutoring.Business.Dtos.Auth;
using ETutoring.Business.Interfaces;
using ETutoring.Core.Utilities;
using ETutoring.DataAccess.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

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

    public async Task<Result<(string AccessToken, string RefreshToken)>> LoginAsync(LoginDto model)
    {
        // Find the user by email
        var user = await _userManager.FindByEmailAsync(model.Email);

        if (user == null)
        {
            return Result<(string, string)>.Failure("Invalid username or password.");
        }

        // Check if the password is correct
        var isPasswordValid = await _userManager.CheckPasswordAsync(user, model.Password);
        if (!isPasswordValid)
        {
            return Result<(string, string)>.Failure("Invalid username or password.");
        }

        // Generate Access Token
        var accessToken = await _tokenService.GenerateToken(user);

        // Generate a new Refresh Token
        var refreshToken = _tokenService.GenerateRefreshToken();
        var refreshTokenExpiryTime = DateTime.UtcNow.AddMonths(1);

        // Add the new Refresh Token to the user's list of tokens
        user.AddRefreshToken(refreshToken, refreshTokenExpiryTime);

        // Save changes to the database
        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            return Result<(string, string)>.Failure("Failed to update refresh token.");
        }

        // Return success result with tokens
        return Result<(string, string)>.Success((accessToken, refreshToken));
    }


    // Get New Refresh Token
    public async Task<Result<(string AccessToken, string RefreshToken)>> RefreshTokenAsync(string refreshToken)
    {
        // Find the user with the provided refresh token
        var user = await _userManager.Users
            .Include(u => u.RefreshTokens) // Include the list of refresh tokens
            .SingleOrDefaultAsync(u => u.RefreshTokens.Any(rt => rt.Token == refreshToken));

        if (user == null)
        {
            return Result<(string, string)>.Failure("Invalid refresh token.");
        }

        // Find the matching refresh token
        var token = user.RefreshTokens.SingleOrDefault(rt => rt.Token == refreshToken);

        if (token == null || token.ExpiryTime <= DateTime.UtcNow)
        {
            return Result<(string, string)>.Failure("Invalid or expired refresh token.");
        }

        // Generate a new Access Token
        var newAccessToken = await _tokenService.GenerateToken(user);

        // Generate a new Refresh Token
        var newRefreshToken = _tokenService.GenerateRefreshToken();
        var newExpiryTime = DateTime.UtcNow.AddMonths(1);

        // Remove the old token and add the new one
        user.RefreshTokens.Remove(token);
        user.AddRefreshToken(newRefreshToken, newExpiryTime);

        // Update the user in the database
        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            return Result<(string, string)>.Failure(updateResult.Errors.Select(e => e.Description).ToArray());
        }

        // Return the new tokens
        return Result<(string, string)>.Success((newAccessToken, newRefreshToken));
    }
}