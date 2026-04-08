using System;

namespace Omnichannel.Models
{
    public class BankTransferPayment
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public string PaymentCode { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal PaidAmount { get; set; }
        public string BankName { get; set; } = string.Empty;
        public string AccountNo { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public string QrUrl { get; set; } = string.Empty;
        public string Status { get; set; } = "PendingPayment";
        public string? TransferContent { get; set; }
        public string? ExternalTransactionId { get; set; }
        public string? AppliedVoucherSnapshotJson { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PaidAt { get; set; }
    }
}
