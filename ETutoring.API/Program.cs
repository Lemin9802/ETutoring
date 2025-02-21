using ETutoring.Business.Interfaces;
using ETutoring.Business.Interfaces.Moderator;
using ETutoring.Business.Interfaces.Services;
using ETutoring.Business.Interfaces.Students;
using ETutoring.Business.Interfaces.Tutor;
using ETutoring.Core.Settings;
using ETutoring.DataAccess.Extensions;
using ETutoring.DataAccess.Services;
using ETutoring.DataAccess.Services.Moderator;
using ETutoring.DataAccess.Services.Students;
using ETutoring.DataAccess.Services.Tutor;
using Microsoft.OpenApi.Models;
using IStudentService = ETutoring.Business.Interfaces.Students.IStudentService;

namespace ETutoring.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo { Title = "ETutoring API", Version = "v1" });

                // Add JWT Bearer Authentication
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Paste your valid JWT token below."
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            },
                            Scheme = "Bearer",
                            Name = "Bearer",
                            In = ParameterLocation.Header,

                        },
                        []
                    }
                });

                // Enable Swagger annotations
                options.EnableAnnotations();
            });

            builder.AddDbContextAndIdentity();

            builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("SmtpSettings"));
            builder.Services.AddScoped<IStudentService, StudentService>();
            builder.Services.AddScoped<IIdentityServices, IdentityServices>();
            builder.Services.AddScoped<ITokenService, TokenService>();
            builder.Services.AddScoped<IUserProfileService, UserProfileService>();
            builder.Services.AddScoped<IModeratorService, ModeratorService>();
            builder.Services.AddScoped<ITutorService, TutorService>();
            builder.Services.AddScoped<IEmailService, EmailService>();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthentication();

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
