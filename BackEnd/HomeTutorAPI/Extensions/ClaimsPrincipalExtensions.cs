using System.Security.Claims;

namespace HomeTutorAPI.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal principal)
    {
        var value = principal.FindFirstValue(ClaimTypes.NameIdentifier)
                 ?? principal.FindFirstValue("sub");
        return value is null ? Guid.Empty : Guid.Parse(value);
    }

    public static string GetRole(this ClaimsPrincipal principal)
        => principal.FindFirstValue(ClaimTypes.Role) ?? "";

    public static bool IsAdmin(this ClaimsPrincipal principal)
        => principal.IsInRole("Admin");

    public static bool IsTutor(this ClaimsPrincipal principal)
        => principal.IsInRole("Tutor");

    public static bool IsStudent(this ClaimsPrincipal principal)
        => principal.IsInRole("Student");
}
