using System;

namespace Omnichannel.Models
{
    public class Voucher
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public decimal DiscountAmount { get; set; }
        public decimal MinOrderValue { get; set; }
        public DateTime ExpiryDate { get; set; }
        public bool IsActive { get; set; } = true;
        public int UsageLimit { get; set; } = 0;
        public int UsedCount { get; set; } = 0;
    }
}
