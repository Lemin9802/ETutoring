using ETutoring.Business.Interfaces;
using ETutoring.Business.Interfaces.Services;
using ETutoring.Business.Services;
using ETutoring.Core.Entities;
using ETutoring.DataAccess.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;

namespace ETutoring.DataAccess.Extensions;

public static class DependencyExtension
{
    public static void AddDbContextAndIdentity(this IHostApplicationBuilder builder)
    {
        string? connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

        builder.Services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseNpgsql(connectionString).UseSnakeCaseNamingConvention();
        });

        builder.Services.AddScoped<IApplicationDbContext, ApplicationDbContext>();
        builder.Services.AddScoped<IBlogService, BlogService>();
        builder.Services.AddScoped<ICommentService, CommentService>();

        // Add Identity
        builder.Services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
        {
            options.Password.RequireDigit = false;
            options.Password.RequiredLength = 0;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequireUppercase = false;
            options.Password.RequireLowercase = false;
        })
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();

        // Using snake_case for routes
        builder.Services.AddRouting(options => options.LowercaseUrls = true);

        // Using snake_case for all request body properties
        builder.Services.AddControllers().AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
            options.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.SnakeCaseLower;
        });

        // Google Authentication
        builder.Services.AddAuthentication().AddGoogle(options =>
        {
            options.ClientId = builder.Configuration["GoogleAuth:ClientId"] ?? throw new InvalidOperationException();
            options.ClientSecret = builder.Configuration["GoogleAuth:ClientSecret"] ?? throw new InvalidOperationException();
        });

        var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Missing JWT Key"));
        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidAudience = builder.Configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(key),
                RoleClaimType = "role"
            };

            options.MapInboundClaims = false;

            options.Events = new JwtBearerEvents
            {
                OnChallenge = context =>
                {
                    context.HandleResponse();
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    context.Response.ContentType = "application/json";
                    var problemDetails = new
                    {
                        status_code = 401,
                        message = "Authentication Failed",
                        detail = "Access denied. Please provide a valid Bearer token.",
                        type = "https://datatracker.ietf.org/doc/html/rfc7235#section-3.1",
                    };
                    return context.Response.WriteAsJsonAsync(problemDetails);
                },

                OnAuthenticationFailed = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    context.Response.ContentType = "application/json";
                    var problemDetails = new
                    {
                        status_code = 401,
                        message = "Authentication Failed",
                        detail = context.Exception.Message,
                        type = "https://datatracker.ietf.org/doc/html/rfc7235#section-3.1",
                    };
                    return context.Response.WriteAsJsonAsync(problemDetails);
                },

                OnForbidden = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    context.Response.ContentType = "application/json";
                    var problemDetails = new
                    {
                        status_code = 403,
                        message = "Authorization Failed",
                        detail = "You do not have permission to access this resource.",
                        type = "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.3"
                    };
                    return context.Response.WriteAsJsonAsync(problemDetails);
                }
            };
        });

        // Apply migrations properly using a scoped service resolution
        ApplyMigrationsAndSeedRoles(builder.Services);
    }

    private static void ApplyMigrationsAndSeedRoles(IServiceCollection services)
    {
        using var serviceProvider = services.BuildServiceProvider();
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();

        try
        {
            dbContext.Database.Migrate(); // Ensure migrations are applied
            roleManager.SeedRoles(); // Ensure roles are seeded
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error applying migrations: {ex.Message}");
            throw;
        }
    }
}
