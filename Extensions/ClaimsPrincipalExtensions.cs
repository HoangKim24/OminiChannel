using System.Security.Claims;

namespace Omnichannel.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static int? GetCurrentUserId(this ClaimsPrincipal user)
        {
            var rawId = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub");
            return int.TryParse(rawId, out var id) ? id : null;
        }
    }
}
