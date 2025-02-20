using ETutoring.Business.Interfaces;
using ETutoring.Business.Interfaces.Services;
using ETutoring.Business.Interfaces.Students;
using ETutoring.DataAccess.Extensions;
using ETutoring.DataAccess.Services;
using ETutoring.DataAccess.Services.Students;
using Microsoft.OpenApi.Models;

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

            builder.Services.AddScoped<IStudentService, StudentService>();

            builder.Services.AddScoped<IIdentityServices, IdentityServices>();
            builder.Services.AddScoped<ITokenService, TokenService>();

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
