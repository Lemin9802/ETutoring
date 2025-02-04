using ETutoring.Business.Dtos.Auth;
using ETutoring.Business.Interfaces;
using ETutoring.Core.Common;
using ETutoring.Core.Entities;
using ETutoring.Core.Utilities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using LoginRequest = ETutoring.Business.Dtos.Auth.LoginRequest;

namespace ETutoring.DataAccess.Services;

public class IdentityServices : IIdentityServices
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly IApplicationDbContext _context;

    public IdentityServices(UserManager<ApplicationUser> userManager, ITokenService tokenService, IApplicationDbContext context)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _context = context;
    }

    public async Task<AuthResult<TokenResponse>> LoginAsync(LoginRequest model)
    {
        // Find the user by email
        var user = await _userManager.FindByEmailAsync(model.Email);

        if (user == null)
        {
            return AuthResult<TokenResponse>.Failure("Invalid username or password.");
        }

        // Check if the password is correct
        var isPasswordValid = await _userManager.CheckPasswordAsync(user, model.Password);
        if (!isPasswordValid)
        {
            return AuthResult<TokenResponse>.Failure("Invalid username or password.");
        }

        // Generate Access Token
        var accessToken = await _tokenService.GenerateToken(user);

        // Generate a new Refresh Token
        var refreshToken = _tokenService.GenerateRefreshToken();
        var refreshTokenExpiryTime = DateTime.UtcNow.AddMonths(1);

        // Add the new Refresh Token to the user's list of tokens
        await AddOrUpdateRefreshTokenAsync(user.Id, refreshToken, refreshTokenExpiryTime, CancellationToken.None);

        // Save changes to the database
        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            return AuthResult<TokenResponse>.Failure("Failed to update refresh token.");
        }

        var tokenResponse = new TokenResponse()
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken
        };

        // Return success result with tokens
        return AuthResult<TokenResponse>.Success(tokenResponse);
    }

    public async Task<AuthResult<Guid>> CreateUserAsync(string userEmail, string password)
    {
        var user = new ApplicationUser()
        {
            UserName = userEmail,
            Email = userEmail,
            Id = Guid.NewGuid()
        };

        var result = await _userManager.CreateAsync(user, password);

        if (!result.Succeeded)
        {
            return AuthResult<Guid>.Failure(result.Errors.Select(e => e.Description).ToArray());
        }

        return AuthResult<Guid>.Success(user.Id);
    }


    // Get New Refresh Token
    public async Task<AuthResult<TokenResponse>> RefreshTokenAsync(string refreshToken)
    {
        // Find the user with the provided refresh token
        var user = await _userManager.Users
            .Include(u => u.RefreshTokens) // Include the list of refresh tokens
            .SingleOrDefaultAsync(u => u.RefreshTokens.Any(rt => rt.Token == refreshToken));

        if (user == null)
        {
            return AuthResult<TokenResponse>.Failure("Invalid refresh token.");
        }

        // Find the matching refresh token
        var token = user.RefreshTokens.SingleOrDefault(rt => rt.Token == refreshToken);

        if (token == null || token.ExpiryTime <= DateTime.UtcNow)
        {
            return AuthResult<TokenResponse>.Failure("Invalid or expired refresh token.");
        }

        // Generate a new Access Token
        var newAccessToken = await _tokenService.GenerateToken(user);

        // Generate a new Refresh Token
        var newRefreshToken = _tokenService.GenerateRefreshToken();
        var newExpiryTime = DateTime.UtcNow.AddMonths(1);

        // Remove the old token and add the new one
        user.RefreshTokens.Remove(token);
        await AddOrUpdateRefreshTokenAsync(user.Id, newRefreshToken, newExpiryTime, CancellationToken.None);

        // Update the user in the database
        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            return AuthResult<TokenResponse>.Failure(updateResult.Errors.Select(e => e.Description).ToArray());
        }

        var newTokenResponse = new TokenResponse()
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken
        };

        // Return the new tokens
        return AuthResult<TokenResponse>.Success(newTokenResponse);
    }

    public async Task<AuthResult<TokenResponse>> SyncGoogleUserAsync(GoogleUserRequest request)
    {
        // Check if the user exists in the database
        var user = await _userManager.FindByEmailAsync(request.Email);

        if (user != null)
        {
            // Generate Access Token
            var accessToken = await _tokenService.GenerateToken(user);

            // Generate Refresh Token
            var refreshToken = _tokenService.GenerateRefreshToken();
            var refreshTokenExpiryTime = DateTime.UtcNow.AddMonths(1);

            // Add or Update Refresh Token in DB
            await AddOrUpdateRefreshTokenAsync(user.Id, refreshToken, refreshTokenExpiryTime, CancellationToken.None);

            // Return Tokens
            var tokenResponse = new TokenResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken
            };

            return AuthResult<TokenResponse>.Success(tokenResponse);
        }

        // Create a new user if one doesn't exist
        user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true,
            ProfilePicture = request.Image
        };

        var createResult = await _userManager.CreateAsync(user);
        if (!createResult.Succeeded)
        {
            return AuthResult<TokenResponse>.Failure(createResult.Errors.Select(e => e.Description).ToArray());
        }

        // Assign default role (Student)
        var roleResult = await _userManager.AddToRoleAsync(user, Constants.STUDENT_ROLE);
        if (!roleResult.Succeeded)
        {
            return AuthResult<TokenResponse>.Failure(roleResult.Errors.Select(e => e.Description).ToArray());
        }

        // Generate Access Token
        var newAccessToken = await _tokenService.GenerateToken(user);

        // Generate Refresh Token
        var newRefreshToken = _tokenService.GenerateRefreshToken();
        var newRefreshTokenExpiryTime = DateTime.UtcNow.AddMonths(1);

        // Add Refresh Token to DB
        await AddOrUpdateRefreshTokenAsync(user.Id, newRefreshToken, newRefreshTokenExpiryTime, CancellationToken.None);

        // Return Tokens
        var newTokenResponse = new TokenResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken
        };

        return AuthResult<TokenResponse>.Success(newTokenResponse);
    }


    private async Task AddOrUpdateRefreshTokenAsync(Guid userId, string token, DateTime expiryTime, CancellationToken cancellationToken)
    {
        // Remove expired tokens directly from the database
        _context.RefreshTokens.RemoveRange(
            _context.RefreshTokens.Where(rt => rt.UserId == userId && rt.ExpiryTime <= DateTime.UtcNow)
        );

        // Add the new refresh token
        var refreshToken = new RefreshToken(token, expiryTime) { UserId = userId };
        _context.RefreshTokens.Add(refreshToken);

        // Save changes with cancellation support
        await _context.SaveChangesAsync(cancellationToken);
    }
}