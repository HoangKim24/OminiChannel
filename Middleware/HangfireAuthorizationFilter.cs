using Hangfire.Dashboard;

namespace Omnichannel.Middleware
{
    public sealed class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
    {
        public bool Authorize(DashboardContext context)
        {
            var user = context.GetHttpContext().User;
            return user.Identity?.IsAuthenticated == true && user.IsInRole("Admin");
        }
    }
}
