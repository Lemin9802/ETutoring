using Amazon.S3;
using ETutoring.API.Hubs;
using ETutoring.API.Middleware;
using ETutoring.Business.Interfaces;
using ETutoring.Business.Interfaces.Message;
using ETutoring.Business.Interfaces.Moderator;
using ETutoring.Business.Interfaces.Services;
using ETutoring.Business.Interfaces.Tutor;
using ETutoring.Business.Services;
using ETutoring.Business.Settings;
using ETutoring.Core.Settings;
using ETutoring.DataAccess.Extensions;
using ETutoring.DataAccess.Services;
using ETutoring.DataAccess.Services.Messages;
using ETutoring.DataAccess.Services.Moderator;
using ETutoring.DataAccess.Services.Students;
using ETutoring.DataAccess.Services.Tutor;
using Microsoft.OpenApi.Models;
using System.Text.Json;
using IStudentService = ETutoring.Business.Interfaces.Students.IStudentService;

namespace ETutoring.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.AllowAnyHeader().AllowAnyMethod().AllowCredentials().SetIsOriginAllowed(_ => true);
                });
            });

            builder.Services.Configure<AWSSettings>(builder.Configuration.GetSection("AWS"));

            // Add services to the container.
            builder.Services.AddControllers();
            builder.Services.AddSignalR();
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

            builder.Services.AddControllers().AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
                options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
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
            builder.Services.AddScoped<IMeetingService, MeetingService>();
            builder.Services.AddScoped<IDashboardService, DashboardService>();
            builder.Services.AddScoped<IMessageService, MessageService>();
            builder.Services.AddScoped<IMessageHubService, MessageHubService>();
            // Add AWS S3 configuration
            builder.Services.AddAWSService<IAmazonS3>();
            builder.Services.AddScoped<IStorageService, AWSS3Service>();
            builder.Services.AddScoped<IDocumentService, DocumentService>();
            builder.Services.AddScoped<IDocumentCommentService, DocumentCommentService>();
            var app = builder.Build();

            app.UseMiddleware<ExceptionHandlingMiddleware>();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseCors("AllowAll");
            app.UseAuthentication();

            app.UseAuthorization();
            app.MapControllers();
            app.MapHub<MessageHub>("/messageHub");

            app.Run();
        }
    }
}
