using System;
using System.IO;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Moq;
using Omnichannel.Middleware;
using Xunit;

namespace Omnichannel.Tests
{
    public class ExceptionMiddlewareTests
    {
        [Fact]
        public async Task InvokeAsync_WhenUnauthorizedExceptionThrown_ShouldReturn403Forbidden()
        {
            // Arrange
            var loggerMock = new Mock<ILogger<ExceptionMiddleware>>();
            var hostEnvironmentMock = new Mock<IHostEnvironment>();
            hostEnvironmentMock.SetupGet(x => x.EnvironmentName).Returns(Environments.Development);
            RequestDelegate next = (HttpContext hc) => throw new UnauthorizedAccessException("Test denied");
            var middleware = new ExceptionMiddleware(next, loggerMock.Object, hostEnvironmentMock.Object);

            var context = new DefaultHttpContext();
            context.Response.Body = new MemoryStream();
            context.Request.Path = "/api/test";

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            Assert.Equal((int)HttpStatusCode.Forbidden, context.Response.StatusCode);
            Assert.Equal("application/json", context.Response.ContentType);

            context.Response.Body.Seek(0, SeekOrigin.Begin);
            var body = await new StreamReader(context.Response.Body).ReadToEndAsync();
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var problemDetails = JsonSerializer.Deserialize<Microsoft.AspNetCore.Mvc.ProblemDetails>(body, options);

            Assert.NotNull(problemDetails);
            Assert.Equal((int)HttpStatusCode.Forbidden, problemDetails.Status);
            Assert.Equal("Access Denied", problemDetails.Title);
            Assert.Equal("Test denied", problemDetails.Detail);
        }
    }
}
