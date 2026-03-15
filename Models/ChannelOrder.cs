namespace Omnichannel.Models
{
    public class ChannelOrder
    {
        public int Id { get; set; }
        public int SalesChannelId { get; set; }
        public SalesChannel? SalesChannel { get; set; }
        public int OrderId { get; set; }
        public Order? Order { get; set; }
        public string ExternalOrderId { get; set; } = string.Empty; // Order ID on the external platform
        public string ChannelStatus { get; set; } = "Received"; // Received, Processing, Shipped, Completed
        public DateTime ReceivedAt { get; set; } = DateTime.Now;
    }
}
