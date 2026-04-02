using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Security.Claims;
using System;

namespace Omnichannel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public UsersController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        private static bool IsAdminRole(string? role) => string.Equals(role?.Trim(), "Admin", StringComparison.OrdinalIgnoreCase);

        private int? GetCurrentUserId()
        {
            var rawId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            return int.TryParse(rawId, out var id) ? id : null;
        }

        private static object ToSafeUser(User user) => new
        {
            user.Id,
            user.Username,
            user.Email,
            user.FullName,
            user.PhoneNumber,
            user.Address,
            user.Role
        };

        [HttpGet]
        public async Task<IActionResult> GetAllUsers([FromHeader(Name = "X-User-Role")] string role, CancellationToken cancellationToken)
        {
            if (!IsAdminRole(role)) return Unauthorized(new { message = "Chỉ Admin mới có quyền xem danh sách người dùng" });

            var users = await _unitOfWork.Users.GetAllAsync(cancellationToken);
            // Hide password
            var safeUsers = users.Select(ToSafeUser);
            return Ok(safeUsers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id, [FromHeader(Name = "X-User-Role")] string role, CancellationToken cancellationToken)
        {
            // Only admin or the user themselves should be able to view details
            // For simplicity in this demo, check if Admin
            if (!IsAdminRole(role)) return Unauthorized(new { message = "Chỉ Admin mới được xem chi tiết" });

            var user = await _unitOfWork.Users.GetByIdAsync(id, cancellationToken);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng" });

            return Ok(ToSafeUser(user));
        }

        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromHeader(Name = "X-User-Role")] string callerRole, [FromBody] UpdateRoleRequest request)
        {
            if (!IsAdminRole(callerRole)) return Unauthorized(new { message = "Chỉ Admin mới được đổi quyền" });

            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng" });

            if (request.Role != "Admin" && request.Role != "User")
            {
                return BadRequest(new { message = "Role không hợp lệ. Phải là 'Admin' hoặc 'User'." });
            }

            user.Role = request.Role;
            _unitOfWork.Users.Update(user);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "Cập nhật quyền thành công" });
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id, [FromHeader(Name = "X-User-Role")] string callerRole)
        {
            if (!IsAdminRole(callerRole)) return Unauthorized(new { message = "Chỉ Admin mới được xóa người dùng" });

            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng" });

            _unitOfWork.Users.Delete(user);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "Xóa người dùng thành công" });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser(CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue) return Unauthorized(new { message = "Không xác định được người dùng hiện tại" });

            var user = await _unitOfWork.Users.GetByIdAsync(userId.Value, cancellationToken);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng hiện tại" });

            return Ok(ToSafeUser(user));
        }

        [Authorize]
        [HttpPut("me")]
        public async Task<IActionResult> UpdateCurrentUser([FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue) return Unauthorized(new { message = "Không xác định được người dùng hiện tại" });

            var user = await _unitOfWork.Users.GetByIdAsync(userId.Value, cancellationToken);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng hiện tại" });

            user.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
            user.FullName = string.IsNullOrWhiteSpace(request.FullName) ? null : request.FullName.Trim();
            user.PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim();
            user.Address = string.IsNullOrWhiteSpace(request.Address) ? null : request.Address.Trim();

            _unitOfWork.Users.Update(user);
            await _unitOfWork.CompleteAsync(cancellationToken);

            return Ok(new { message = "Cập nhật hồ sơ thành công", user = ToSafeUser(user) });
        }

        [Authorize]
        [HttpPut("me/password")]
        public async Task<IActionResult> ChangeCurrentPassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue) return Unauthorized(new { message = "Không xác định được người dùng hiện tại" });

            if (request.NewPassword != request.ConfirmPassword)
                return BadRequest(new { message = "Xác nhận mật khẩu không khớp" });

            var user = await _unitOfWork.Users.GetByIdAsync(userId.Value, cancellationToken);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng hiện tại" });

            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.Password))
                return BadRequest(new { message = "Mật khẩu hiện tại không đúng" });

            user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            _unitOfWork.Users.Update(user);
            await _unitOfWork.CompleteAsync(cancellationToken);

            return Ok(new { message = "Đổi mật khẩu thành công" });
        }
    }

    public class UpdateRoleRequest
    {
        public string Role { get; set; } = string.Empty;
    }
}
