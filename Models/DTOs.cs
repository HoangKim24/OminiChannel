using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Omnichannel.Models
{
    // ========== AUTH ==========

    public class RegisterRequest
    {
        [Required(ErrorMessage = "Tên đăng nhập là bắt buộc")]
        [MinLength(3, ErrorMessage = "Tên đăng nhập phải có ít nhất 3 ký tự")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự")]
        public string Password { get; set; } = string.Empty;

        public string? Email { get; set; }
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
    }

    public class LoginResponse
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? Email { get; set; }
    }

    // ========== ORDERS ==========

    public class PlaceBatchOrderRequest
    {
        [Required(ErrorMessage = "UserId là bắt buộc")]
        public int UserId { get; set; }

        [Required(ErrorMessage = "Danh sách sản phẩm không được rỗng")]
        [MinLength(1, ErrorMessage = "Cần ít nhất 1 sản phẩm")]
        public List<PlaceBatchOrderItem> Items { get; set; } = new();

        [Required(ErrorMessage = "Địa chỉ giao hàng là bắt buộc")]
        public string ShippingAddress { get; set; } = string.Empty;

        [Required(ErrorMessage = "Số điện thoại là bắt buộc")]
        public string ReceiverPhone { get; set; } = string.Empty;

        public string? Note { get; set; }
        public bool IsPickup { get; set; } = false;
    }

    public class PlaceBatchOrderItem
    {
        [Required]
        public int PerfumeId { get; set; }

        [Range(1, 100, ErrorMessage = "Số lượng phải từ 1 đến 100")]
        public int Quantity { get; set; }
    }

    // ========== COMMENTS ==========

    public class CreateCommentRequest
    {
        [Required(ErrorMessage = "PerfumeId là bắt buộc")]
        public int PerfumeId { get; set; }

        [Required(ErrorMessage = "Tên người đánh giá là bắt buộc")]
        public string UserName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Nội dung đánh giá là bắt buộc")]
        public string Text { get; set; } = string.Empty;

        [Range(1, 5, ErrorMessage = "Số sao phải từ 1 đến 5")]
        public int Stars { get; set; } = 5;

        public bool IsVerified { get; set; } = false;
    }

    public class CommentResponse
    {
        public int Id { get; set; }
        public int PerfumeId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int Stars { get; set; }
        public string Text { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsVerified { get; set; }
    }

    // ========== DASHBOARD ==========

    public class DashboardStatsResponse
    {
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public int TotalProducts { get; set; }
        public int TotalCustomers { get; set; }
        public List<OrderSummary> RecentOrders { get; set; } = new();
        public List<LowStockItem> LowStockProducts { get; set; } = new();
    }

    public class OrderSummary
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? CustomerName { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public DateTime OrderDate { get; set; }
        public int ItemCount { get; set; }
    }

    public class LowStockItem
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int StockQuantity { get; set; }
    }

    public class CustomerSummary
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public decimal TotalSpend { get; set; }
        public int OrderCount { get; set; }
        public DateTime? LastOrderDate { get; set; }
    }
}
