using System;

namespace Omnichannel.Models
{
    public class VoucherRedemption
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int VoucherId { get; set; }
        public int OrderId { get; set; }
        public DateTime RedeemedAt { get; set; } = DateTime.UtcNow;
        public decimal DiscountAmount { get; set; }

        public Voucher? Voucher { get; set; }
    }
}