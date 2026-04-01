using Microsoft.AspNetCore.Mvc;
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

        [HttpGet]
        public async Task<IActionResult> GetAllUsers([FromHeader(Name = "X-User-Role")] string role, CancellationToken cancellationToken)
        {
            if (role != "Admin") return Unauthorized(new { message = "Chỉ Admin mới có quyền xem danh sách người dùng" });

            var users = await _unitOfWork.Users.GetAllAsync(cancellationToken);
            // Hide password
            var safeUsers = users.Select(u => new {
                u.Id,
                u.Username,
                u.Email,
                u.FullName,
                u.PhoneNumber,
                u.Address,
                u.Role
            });
            return Ok(safeUsers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id, [FromHeader(Name = "X-User-Role")] string role, CancellationToken cancellationToken)
        {
            // Only admin or the user themselves should be able to view details
            // For simplicity in this demo, check if Admin
            if (role != "Admin") return Unauthorized(new { message = "Chỉ Admin mới được xem chi tiết" });

            var user = await _unitOfWork.Users.GetByIdAsync(id, cancellationToken);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng" });

            return Ok(new {
                user.Id,
                user.Username,
                user.Email,
                user.FullName,
                user.PhoneNumber,
                user.Address,
                user.Role
            });
        }

        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromHeader(Name = "X-User-Role")] string callerRole, [FromBody] UpdateRoleRequest request)
        {
            if (callerRole != "Admin") return Unauthorized(new { message = "Chỉ Admin mới được đổi quyền" });

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
            if (callerRole != "Admin") return Unauthorized(new { message = "Chỉ Admin mới được xóa người dùng" });

            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng" });

            _unitOfWork.Users.Delete(user);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "Xóa người dùng thành công" });
        }
    }

    public class UpdateRoleRequest
    {
        public string Role { get; set; } = string.Empty;
    }
}
