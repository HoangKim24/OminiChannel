namespace Omnichannel.Models
{
    public class ChannelProduct
    {
        public int Id { get; set; }
        public int SalesChannelId { get; set; }
        public SalesChannel? SalesChannel { get; set; }
        public int PerfumeId { get; set; }
        public Perfume? Perfume { get; set; }
        public decimal ChannelPrice { get; set; } // Price on this specific channel
        public bool IsListed { get; set; } = true; // Whether actively listed
        public DateTime? LastSyncedAt { get; set; }
    }
}
