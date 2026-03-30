using Microsoft.EntityFrameworkCore;
using Omnichannel.Infrastructure;
using Omnichannel.Repositories;
using Omnichannel.Services;
using FluentValidation;
using Omnichannel.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblyContaining<Program>());

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

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseCors("AllowAll");
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
