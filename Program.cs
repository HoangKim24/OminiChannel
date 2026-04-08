using System.Text;
using System.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpLogging;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Omnichannel.Infrastructure;
using Omnichannel.Repositories;
using Omnichannel.Services;
using FluentValidation;
using FluentValidation.AspNetCore;
using Omnichannel.Middleware;
using Omnichannel.Swagger;
using Hangfire;
using Hangfire.SqlServer;
using Swashbuckle.AspNetCore.Annotations;

var builder = WebApplication.CreateBuilder(args);
var isTesting = builder.Environment.IsEnvironment("Testing");

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
    options.EnableAnnotations();
});

builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddFluentValidationAutoValidation();
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
    throw new InvalidOperationException(
        "Jwt:Key is not configured. Use user-secrets, environment variables, or appsettings.Development.json.");
}

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString) && !isTesting)
{
    throw new InvalidOperationException(
        "ConnectionStrings:DefaultConnection is not configured. Use user-secrets, environment variables, or appsettings.Development.json.");
}

if (string.IsNullOrWhiteSpace(connectionString) && isTesting)
{
    connectionString = "Server=(localdb)\\MSSQLLocalDB;Database=Omnichannel_TestBootstrap;Trusted_Connection=True;TrustServerCertificate=True;";
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
    options.UseSqlServer(connectionString));

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
builder.Services.AddScoped<BatchOrderService>();
builder.Services.AddScoped<VoucherPricingService>();
builder.Services.AddScoped<RecommendationService>();
builder.Services.AddScoped<IRecommendationFacade, RecommendationFacade>();
builder.Services.AddScoped<OmnichannelBackgroundSyncService>();

// Add Hangfire Services
if (!isTesting)
{
    builder.Services.AddHangfire(configuration => configuration
        .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UseSqlServerStorage(connectionString));

    builder.Services.AddHangfireServer();
}

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

app.Lifetime.ApplicationStarted.Register(() =>
{
    var server = app.Services.GetRequiredService<IServer>();
    var addresses = server.Features.Get<IServerAddressesFeature>();
    var webAddress = addresses?.Addresses.FirstOrDefault() ?? "(unknown)";
    Console.WriteLine($"Web running at: {webAddress}");
});

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

if (!isTesting)
{
    app.UseHangfireDashboard("/hangfire", new DashboardOptions
    {
        Authorization = new[] { new HangfireAuthorizationFilter() }
    });
}

// Initialize Observers in a dedicated scope
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var dbContext = scope.ServiceProvider.GetRequiredService<OmnichannelDbContext>();
    if (!isTesting && dbContext.Database.IsRelational())
    {
        var shouldRunMigrations = true;

        if (dbContext.Database.GetDbConnection() is SqlConnection sqlConnection)
        {
            var initialState = sqlConnection.State;
            if (initialState != ConnectionState.Open)
            {
                sqlConnection.Open();
            }

            try
            {
                using var cmd = sqlConnection.CreateCommand();
                cmd.CommandText = "SELECT OBJECT_ID(N'[__EFMigrationsHistory]')";
                var historyTableExists = cmd.ExecuteScalar() is not DBNull and not null;
                cmd.CommandText = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME <> '__EFMigrationsHistory'";
                var userTableCount = Convert.ToInt32(cmd.ExecuteScalar());

                if (!historyTableExists)
                {
                    if (userTableCount > 0)
                    {
                        shouldRunMigrations = false;
                        logger.LogInformation(
                            "Database {Database} already has tables but no EF migration history. Skipping startup migrations to avoid duplicate-object failures.",
                            sqlConnection.Database);
                    }
                }
                else
                {
                    cmd.CommandText = "SELECT COUNT(*) FROM [__EFMigrationsHistory]";
                    var migrationRows = Convert.ToInt32(cmd.ExecuteScalar());

                    if (migrationRows == 0 && userTableCount > 0)
                    {
                        shouldRunMigrations = false;
                        logger.LogInformation(
                            "Database {Database} has existing schema but empty EF migration history. Skipping startup migrations to avoid duplicate-object failures.",
                            sqlConnection.Database);
                    }
                }
            }
            finally
            {
                if (initialState != ConnectionState.Open)
                {
                    sqlConnection.Close();
                }
            }
        }

        if (shouldRunMigrations)
        {
            try
            {
                dbContext.Database.Migrate();
            }
            catch (SqlException ex) when (ex.Number == 2714)
            {
                logger.LogWarning(ex,
                    "Skipping startup migration because target objects already exist in database {Database}.",
                    dbContext.Database.GetDbConnection().Database);
            }
        }
    }

    var subject = scope.ServiceProvider.GetRequiredService<InventorySubject>();
    if (!isTesting)
    {
        var jobClient = scope.ServiceProvider.GetRequiredService<IBackgroundJobClient>();
        var observerLogger = scope.ServiceProvider.GetRequiredService<ILogger<OmnichannelSyncObserver>>();
        subject.Attach(new OmnichannelSyncObserver(jobClient, observerLogger));
    }
}

app.Run();

public partial class Program { }
