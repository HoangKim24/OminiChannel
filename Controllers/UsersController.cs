using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Omnichannel.Extensions;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

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
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 50, CancellationToken cancellationToken = default)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize < 1 ? 50 : pageSize;

            var users = await _unitOfWork.Users.GetPaginatedAsync(page, pageSize, cancellationToken);
            var safeUsers = users.Data.Select(ToSafeUser).ToList();

            return Ok(new PaginatedResult<object>
            {
                Data = safeUsers,
                TotalCount = users.TotalCount,
                Page = users.Page,
                PageSize = users.PageSize
            });
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUserById(int id, CancellationToken cancellationToken)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id, cancellationToken);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng" });

            return Ok(ToSafeUser(user));
        }

        [HttpPut("{id}/role")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateRoleRequest request)
        {
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
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
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
            var userId = User.GetCurrentUserId();
            if (!userId.HasValue) return Unauthorized(new { message = "Không xác định được người dùng hiện tại" });

            var user = await _unitOfWork.Users.GetByIdAsync(userId.Value, cancellationToken);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng hiện tại" });

            return Ok(ToSafeUser(user));
        }

        [Authorize]
        [HttpPut("me")]
        public async Task<IActionResult> UpdateCurrentUser([FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
        {
            var userId = User.GetCurrentUserId();
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
            var userId = User.GetCurrentUserId();
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
