using Microsoft.AspNetCore.Mvc;
using Omnichannel.Models;
using Omnichannel.Services;

namespace Omnichannel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Dữ liệu không hợp lệ", errors = ModelState });

            var response = await _authService.LoginAsync(request);
            if (response == null)
                return Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu" });

            return Ok(response);
        }

        [HttpPost("admin-login")]
        public async Task<IActionResult> AdminLogin([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Dữ liệu không hợp lệ", errors = ModelState });

            var response = await _authService.LoginAsAdminAsync(request);
            if (response == null)
                return Unauthorized(new { message = "Tài khoản admin hoặc mật khẩu không đúng" });

            if (!string.Equals(response.Role, "Admin", StringComparison.OrdinalIgnoreCase))
                return Unauthorized(new { message = "Tài khoản này không phải admin" });

            return Ok(response);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Dữ liệu không hợp lệ", errors = ModelState });

            var result = await _authService.RegisterAsync(request);
            if (!result.Success)
                return BadRequest(new { message = result.Message });

            return Created("", new { message = result.Message });
        }
    }
}
