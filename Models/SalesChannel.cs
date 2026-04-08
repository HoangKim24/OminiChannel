namespace Omnichannel.Models
{
    public class SalesChannel
    {
        public int Id { get; set; }
        public string ChannelName { get; set; } = string.Empty; // Shopee, TikTok, Lazada, Website...
        public bool IsActive { get; set; } = true;
        public string? ApiKey { get; set; }
        public string? LogoUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
