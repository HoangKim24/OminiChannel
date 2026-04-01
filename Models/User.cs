namespace Omnichannel.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string Role { get; set; } = "User"; // User or Admin
    }

    public class LoginRequest
    {
        [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "Tên đăng nhập là bắt buộc")]
        public string Username { get; set; } = string.Empty;

        [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        public string Password { get; set; } = string.Empty;
    }
}
