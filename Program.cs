using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpLogging;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Omnichannel.Infrastructure;
using Omnichannel.Repositories;
using Omnichannel.Services;
using FluentValidation;
using Omnichannel.Middleware;
using Omnichannel.Swagger;

var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>(optional: true);
}

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Omnichannel API",
        Version = "v1",
        Description = "API for Omnichannel .NET + React platform"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Input token as: Bearer {your JWT token}"
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
                }
            },
            Array.Empty<string>()
        }
    });

    options.OperationFilter<SwaggerDefaultResponsesOperationFilter>();
});

builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblyContaining<Program>());
builder.Services.AddHttpLogging(options =>
{
    options.LoggingFields = HttpLoggingFields.RequestPath |
                            HttpLoggingFields.RequestMethod |
                            HttpLoggingFields.ResponseStatusCode |
                            HttpLoggingFields.Duration;
});
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(x => x.Value?.Errors.Count > 0)
            .Select(x => new
            {
                field = x.Key,
                messages = x.Value!.Errors.Select(e => e.ErrorMessage)
            });

        return new BadRequestObjectResult(new
        {
            message = "Validation failed",
            errors
        });
    };
});

var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey))
{
    jwtKey = "dev-only-change-me-32-chars-minimum";
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
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
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// Register SQL Database
builder.Services.AddDbContext<OmnichannelDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register Patterns Implementation
builder.Services.AddScoped<IUnitOfWork, SqlUnitOfWork>();
builder.Services.AddScoped<IPerfumeRepository, SqlPerfumeRepository>();
builder.Services.AddScoped<IOrderRepository, SqlOrderRepository>();
builder.Services.AddScoped<ICommentRepository, SqlCommentRepository>();
builder.Services.AddScoped<IPaymentStrategy, CreditCardPayment>();
builder.Services.AddScoped<VNPayStrategy>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IOmnichannelAdapter, ShopeeAdapter>();
builder.Services.AddScoped<IOmnichannelAdapter, TikTokAdapter>();
builder.Services.AddScoped<IOmnichannelAdapter, LazadaAdapter>();
builder.Services.AddScoped<InventorySubject>();
builder.Services.AddScoped<OrderFacade>();
builder.Services.AddScoped<RecommendationService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();
app.UseHttpLogging();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html");

// Initialize Observers in a dedicated scope
using (var scope = app.Services.CreateScope())
{
    var subject = scope.ServiceProvider.GetRequiredService<InventorySubject>();
    var adapters = scope.ServiceProvider.GetServices<IOmnichannelAdapter>();
    subject.Attach(new OmnichannelSyncObserver(adapters));
}

app.Run();

public partial class Program { }
