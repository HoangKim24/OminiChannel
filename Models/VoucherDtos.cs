using System;
using System.Collections.Generic;

namespace Omnichannel.Models
{
    public class VoucherUpsertRequest
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string VoucherType { get; set; } = VoucherTypes.Order;
        public string DiscountType { get; set; } = VoucherDiscountTypes.FixedAmount;
        public decimal DiscountValue { get; set; }
        public decimal? MaxDiscountAmount { get; set; }
        public decimal MinOrderValue { get; set; }
        public DateTime StartAt { get; set; }
        public DateTime EndAt { get; set; }
        public int? UsageLimitTotal { get; set; }
        public int? UsageLimitPerUser { get; set; }
        public int? SalesChannelId { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class VoucherLookupRequest
    {
        public string Code { get; set; } = string.Empty;
        public int? UserId { get; set; }
        public decimal ItemsSubtotal { get; set; } = 0;
        public decimal ShippingFee { get; set; } = 0;
        public int? SalesChannelId { get; set; }
    }

    public class VoucherApplyRequest
    {
        public int UserId { get; set; }
        public decimal ItemsSubtotal { get; set; }
        public decimal ShippingFee { get; set; }
        public string? VoucherCode { get; set; }
        public string? OrderVoucherCode { get; set; }
        public string? ShippingVoucherCode { get; set; }
        public int? SalesChannelId { get; set; }
    }

    public class VoucherApplyResponse
    {
        public decimal ItemsSubtotal { get; set; }
        public decimal ShippingFee { get; set; }
        public decimal OrderVoucherDiscount { get; set; }
        public decimal ShippingVoucherDiscount { get; set; }
        public decimal FinalTotal { get; set; }
        public List<VoucherAppliedLine> AppliedVouchers { get; set; } = new();
    }

    public class VoucherValidationResponse
    {
        public bool IsValid { get; set; }
        public string Message { get; set; } = string.Empty;
        public decimal DiscountAmount { get; set; }
        public VoucherAppliedLine? AppliedVoucher { get; set; }
    }

    public class VoucherAppliedLine
    {
        public int VoucherId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string VoucherType { get; set; } = string.Empty;
        public string DiscountType { get; set; } = string.Empty;
        public decimal AppliedBaseAmount { get; set; }
        public decimal DiscountAmount { get; set; }
    }

    public class VoucherResponse
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string VoucherType { get; set; } = string.Empty;
        public string DiscountType { get; set; } = string.Empty;
        public decimal DiscountValue { get; set; }
        public decimal? MaxDiscountAmount { get; set; }
        public decimal MinOrderValue { get; set; }
        public DateTime StartAt { get; set; }
        public DateTime EndAt { get; set; }
        public int? UsageLimitTotal { get; set; }
        public int? UsageLimitPerUser { get; set; }
        public int? SalesChannelId { get; set; }
        public string? SalesChannelName { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public int TotalRedemptions { get; set; }
    }

    public class PublicVoucherListItemResponse
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string VoucherType { get; set; } = string.Empty;
        public string DiscountType { get; set; } = string.Empty;
        public decimal DiscountValue { get; set; }
        public decimal? MaxDiscountAmount { get; set; }
        public decimal MinOrderValue { get; set; }
        public DateTime EndAt { get; set; }
    }
}