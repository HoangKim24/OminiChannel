using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Omnichannel.Infrastructure;
using Omnichannel.Models;

namespace Omnichannel.Services
{
    public interface IAuthService
    {
        Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
        Task<LoginResponse?> LoginAsAdminAsync(LoginRequest request, CancellationToken cancellationToken = default);
        Task<(bool Success, string Message)> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    }

    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;

        public AuthService(IUnitOfWork unitOfWork, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
        }

        public async Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
        {
            return await LoginInternalAsync(request, requiredRole: "User", cancellationToken);
        }

        public async Task<LoginResponse?> LoginAsAdminAsync(LoginRequest request, CancellationToken cancellationToken = default)
        {
            return await LoginInternalAsync(request, requiredRole: "Admin", cancellationToken);
        }

        private async Task<LoginResponse?> LoginInternalAsync(LoginRequest request, string? requiredRole, CancellationToken cancellationToken)
        {
            var normalizedUsername = NormalizeUsername(request.Username);
            if (string.IsNullOrWhiteSpace(normalizedUsername))
            {
                return null;
            }

            var user = await _unitOfWork.Users.GetByUsernameAsync(normalizedUsername, cancellationToken);
            if (user == null)
            {
                return null;
            }

            var isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);
            if (!isPasswordValid)
            {
                return null;
            }

            if (!string.IsNullOrWhiteSpace(requiredRole) && !string.Equals(user.Role, requiredRole, StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            var expiresAt = DateTime.UtcNow.AddHours(8);
            var token = GenerateJwtToken(user, expiresAt);

            return new LoginResponse
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role,
                FullName = user.FullName,
                Email = user.Email,
                AccessToken = token,
                TokenType = "Bearer",
                ExpiresAt = expiresAt
            };
        }

        public async Task<(bool Success, string Message)> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
        {
            var normalizedUsername = NormalizeUsername(request.Username);
            if (string.IsNullOrWhiteSpace(normalizedUsername))
            {
                return (false, "Tên đăng nhập là bắt buộc");
            }

            var existed = await _unitOfWork.Users.GetByUsernameAsync(normalizedUsername, cancellationToken);
            if (existed != null)
            {
                return (false, "Tên đăng nhập đã tồn tại");
            }

            var user = new User
            {
                Username = normalizedUsername,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Email = request.Email,
                FullName = request.FullName,
                PhoneNumber = request.PhoneNumber,
                Address = request.Address,
                Role = "User"
            };

            await _unitOfWork.Users.AddAsync(user, cancellationToken);
            await _unitOfWork.CompleteAsync(cancellationToken);

            return (true, "Đăng ký thành công");
        }

        private static string NormalizeUsername(string? username)
        {
            return (username ?? string.Empty).Trim();
        }

        private string GenerateJwtToken(User user, DateTime expiresAtUtc)
        {
            var key = _configuration["Jwt:Key"];
            if (string.IsNullOrWhiteSpace(key))
            {
                key = "dev-only-change-me-32-chars-minimum";
            }

            var issuer = _configuration["Jwt:Issuer"] ?? "Omnichannel";
            var audience = _configuration["Jwt:Audience"] ?? "Omnichannel.Client";

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: expiresAtUtc,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
