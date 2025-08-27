using System.Security.Claims;

namespace WebChat.Common;

public static class ClaimsPrincipleExtensions
{
    public static string GetUserName(this ClaimsPrincipal claimsPrincipal)
    {
        return claimsPrincipal.FindFirstValue(ClaimTypes.Name) ?? throw new Exception("Cannot get username");
    }

    public static Guid GetUserId(this ClaimsPrincipal claimsPrincipal)
    {
        return Guid.Parse(claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier) ??
            throw new Exception("Id Cannot be found"));
    }

}