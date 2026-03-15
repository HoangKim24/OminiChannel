using Microsoft.EntityFrameworkCore;
using Omnichannel.Infrastructure;
using Omnichannel.Repositories;
using Omnichannel.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register SQL Database
builder.Services.AddDbContext<OmnichannelDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register Patterns Implementation
builder.Services.AddScoped<IUnitOfWork, SqlUnitOfWork>();
builder.Services.AddScoped<IPerfumeRepository, SqlPerfumeRepository>();
builder.Services.AddScoped<IOrderRepository, SqlOrderRepository>();
builder.Services.AddScoped<ICommentRepository, SqlCommentRepository>();
builder.Services.AddScoped<IPaymentStrategy, CreditCardPayment>();
builder.Services.AddScoped<IOmnichannelAdapter, ShopeeAdapter>();
builder.Services.AddScoped<IOmnichannelAdapter, TikTokAdapter>();
builder.Services.AddScoped<IOmnichannelAdapter, LazadaAdapter>();
builder.Services.AddScoped<InventorySubject>();
builder.Services.AddScoped<OrderFacade>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseDefaultFiles(); // Allow index.html as default
app.UseStaticFiles();  // Serve files from wwwroot

// app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthorization();

app.MapAreaControllerRoute(
    name: "AdminArea",
    areaName: "Admin",
    pattern: "Admin/{controller=Home}/{action=Index}/{id?}");
    
app.MapControllers();

// Initialize Observers
using (var scope = app.Services.CreateScope())
{
    var subject = scope.ServiceProvider.GetRequiredService<InventorySubject>();
    var adapters = scope.ServiceProvider.GetServices<IOmnichannelAdapter>();
    subject.Attach(new OmnichannelSyncObserver(adapters));
}

app.Run();
