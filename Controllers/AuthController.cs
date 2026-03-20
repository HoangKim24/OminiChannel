using Microsoft.AspNetCore.Mvc;
using Omnichannel.Models;

namespace Omnichannel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly Infrastructure.IUnitOfWork _unitOfWork;

        public AuthController(Infrastructure.IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Dữ liệu không hợp lệ", errors = ModelState });

            var user = await _unitOfWork.Users.GetByUsernameAsync(request.Username);
            if (user == null || user.Password != request.Password)
                return Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu" });

            return Ok(new LoginResponse
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role,
                FullName = user.FullName,
                Email = user.Email
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Dữ liệu không hợp lệ", errors = ModelState });

            if (await _unitOfWork.Users.GetByUsernameAsync(request.Username) != null)
                return BadRequest(new { message = "Tên đăng nhập đã tồn tại" });

            var user = new User
            {
                Username = request.Username,
                Password = request.Password,
                Email = request.Email,
                FullName = request.FullName,
                PhoneNumber = request.PhoneNumber,
                Address = request.Address,
                Role = "User"
            };

            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.CompleteAsync();

            return Created("", new { message = "Đăng ký thành công" });
        }
    }
}
