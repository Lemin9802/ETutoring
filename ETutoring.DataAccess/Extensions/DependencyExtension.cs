using ETutoring.Business.Interfaces;
using ETutoring.Core.Entities;
using ETutoring.DataAccess.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Text.Json;

namespace ETutoring.DataAccess.Extensions;

public static class DependencyExtension
{
    public static async void AddDbContextAndIdentity(this IHostApplicationBuilder builder)
    {
        string? connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

        builder.Services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseNpgsql(connectionString).UseSnakeCaseNamingConvention();
        });

        builder.Services.AddScoped<IApplicationDbContext, ApplicationDbContext>();

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

        //Using snake_case for routes
        builder.Services.AddRouting(options => options.LowercaseUrls = true);

        //Using snake_case for all request body properties
        builder.Services.AddControllers().AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;

            // For form
            options.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.SnakeCaseLower;
        });

        // Google Authentication
        builder.Services.AddAuthentication().AddGoogle(options =>
        {
            options.ClientId = builder.Configuration["GoogleAuth:ClientId"] ?? throw new InvalidOperationException();
            options.ClientSecret = builder.Configuration["GoogleAuth:ClientSecret"] ?? throw new InvalidOperationException();
        });

        // Apply migrations during app initialization
        using (var scope = builder.Services.BuildServiceProvider().CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();

            await roleManager.SeedRolesAsync();

            await dbContext.Database.MigrateAsync();
        }
    }
}