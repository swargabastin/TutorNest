using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using HomeTutorAPI.Extensions;
using HomeTutorAPI.Models;
using Microsoft.IdentityModel.Tokens;

namespace HomeTutorAPI.Services;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
}

public class TokenService(IConfiguration cfg) : ITokenService
{
    public string GenerateAccessToken(User user)
    {
        var secret = cfg["Jwt:SecretKey"] ?? throw new InvalidOperationException("Jwt:SecretKey is required.");
        var key   = new SymmetricSecurityKey(ServiceExtensions.GetJwtKeyBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub,   user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role,               user.Role.ToString()),
            new Claim("fullName",                    user.FullName),
            new Claim(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer:            cfg["Jwt:Issuer"],
            audience:          cfg["Jwt:Audience"],
            claims:            claims,
            expires:           DateTime.UtcNow.AddMinutes(
                                   double.Parse(cfg["Jwt:AccessTokenMinutes"] ?? "60")),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
        => Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
}
