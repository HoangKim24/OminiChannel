namespace Omnichannel.Models
{
    public class Perfume
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Brand { get; set; } = "KP";
        public decimal Price { get; set; }
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public int? CategoryId { get; set; }
        public Category? Category { get; set; }
        public string Gender { get; set; } = "Unisex";
        public int StockQuantity { get; set; }
        
        // Enriched Details
        public string? TopNotes { get; set; }
        public string? MiddleNotes { get; set; }
        public string? BaseNotes { get; set; }
        public string? Origin { get; set; }
        public string? Concentration { get; set; } // EDP, EDT, etc.
        public string? BrandStory { get; set; }
        public string? VolumeOptions { get; set; } // e.g., "30ml:0.7,50ml:1.0,100ml:1.6"
    }
}
