using System;
using System.Collections.Generic;

namespace Omnichannel.Models
{
    public class Voucher
    {
        public int Id { get; set; }
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
        public bool IsDeleted { get; set; } = false;
        public SalesChannel? SalesChannel { get; set; }
        public List<VoucherRedemption> Redemptions { get; set; } = new();
    }

    public static class VoucherTypes
    {
        public const string Order = "Order";
        public const string Shipping = "Shipping";
    }

    public static class VoucherDiscountTypes
    {
        public const string Percentage = "Percentage";
        public const string FixedAmount = "FixedAmount";
    }
}
