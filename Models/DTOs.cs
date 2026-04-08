using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Omnichannel.Models
{
    public class PaginatedResult<T>
    {
        public IEnumerable<T> Data { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
    }

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
        public string AccessToken { get; set; } = string.Empty;
        public string TokenType { get; set; } = "Bearer";
        public DateTime ExpiresAt { get; set; }
    }

    public class UpdateProfileRequest
    {
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
    }

    public class ChangePasswordRequest
    {
        [Required(ErrorMessage = "Mật khẩu hiện tại là bắt buộc")]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu mới là bắt buộc")]
        [MinLength(6, ErrorMessage = "Mật khẩu mới phải có ít nhất 6 ký tự")]
        public string NewPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Xác nhận mật khẩu là bắt buộc")]
        public string ConfirmPassword { get; set; } = string.Empty;
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

        [Range(0, double.MaxValue, ErrorMessage = "Phí ship không hợp lệ")]
        public decimal ShippingFee { get; set; } = 0;

        public string? Note { get; set; }
        public bool IsPickup { get; set; } = false;
        public string? VoucherCode { get; set; }
        public string? OrderVoucherCode { get; set; }
        public string? ShippingVoucherCode { get; set; }
        public int? SalesChannelId { get; set; }

        [Required(ErrorMessage = "Hình thức thanh toán là bắt buộc")]
        [RegularExpression("^(Cash|BankTransfer)$", ErrorMessage = "Hình thức thanh toán không hợp lệ")]
        public string PaymentMethod { get; set; } = "Cash";
    }

    public class PlaceBatchOrderItem
    {
        [Required]
        public int PerfumeId { get; set; }

        [Range(1, 100, ErrorMessage = "Số lượng phải từ 1 đến 100")]
        public int Quantity { get; set; }
    }

    public class CreateBankTransferPaymentResponse
    {
        public int OrderId { get; set; }
        public string PaymentCode { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string BankName { get; set; } = string.Empty;
        public string AccountNo { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public string QrUrl { get; set; } = string.Empty;
        public string Status { get; set; } = "PendingPayment";
    }

    public class BankTransferPaymentStatusResponse
    {
        public int OrderId { get; set; }
        public string PaymentCode { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal PaidAmount { get; set; }
        public bool IsPaid { get; set; }
        public string PaymentStatus { get; set; } = string.Empty;
        public string OrderStatus { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    public class BankTransferVerificationRequest
    {
        [Required]
        public string PaymentCode { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public decimal PaidAmount { get; set; }

        [Required]
        public string TransferContent { get; set; } = string.Empty;

        [Required]
        public string DestinationAccountNo { get; set; } = string.Empty;

        public string? ExternalTransactionId { get; set; }
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

    public class InventoryProductSummary
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public string Concentration { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public bool IsLowStock { get; set; }
    }

    public class InventoryChannelSummary
    {
        public int SalesChannelId { get; set; }
        public string ChannelName { get; set; } = string.Empty;
        public int TotalListings { get; set; }
        public int ActiveListings { get; set; }
        public DateTime? LastSyncedAt { get; set; }
    }

    public class InventoryOverviewResponse
    {
        public int TotalStock { get; set; }
        public decimal TotalValue { get; set; }
        public int LowStockCount { get; set; }
        public int ActiveChannels { get; set; }
        public int TotalListings { get; set; }
        public List<InventoryProductSummary> Products { get; set; } = new();
        public List<InventoryChannelSummary> Channels { get; set; } = new();
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
