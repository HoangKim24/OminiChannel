using Microsoft.AspNetCore.Mvc;
using Omnichannel.Models;
using System.Collections.Generic;
using System.Linq;

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
            var user = await _unitOfWork.Users.GetByUsernameAsync(request.Username);
            if (user == null || user.Password != request.Password) 
                return Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu" });

            return Ok(new 
            { 
                id = user.Id, 
                username = user.Username, 
                role = user.Role,
                token = "mock-jwt-token-" + user.Username // Simplified for demo
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            if (await _unitOfWork.Users.GetByUsernameAsync(user.Username) != null)
                return BadRequest(new { message = "Tên đăng nhập đã tồn tại" });

            user.Role = "User"; // Default role
            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.CompleteAsync();
            return Ok(new { message = "Đăng ký thành công" });
        }
    }
}
