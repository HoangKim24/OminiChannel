namespace Omnichannel.Models
{
    /// <summary>
    /// Tracks product-to-product relationships for recommendations
    /// Pattern: Customers who bought Product A also bought Product B
    /// </summary>
    public class Recommendation
    {
        public int Id { get; set; }
        
        /// <summary>
        /// Source product (the one being viewed)
        /// </summary>
        public int SourcePerfumeId { get; set; }
        
        /// <summary>
        /// Recommended product (suggested product)
        /// </summary>
        public int RecommendedPerfumeId { get; set; }
        
        /// <summary>
        /// Co-occurrence score (0-100): how often customers bought both together
        /// Higher score = stronger recommendation
        /// </summary>
        public int CoOccurrenceScore { get; set; }
        
        /// <summary>
        /// Recommendation type: "CoSold" or "Related" (category, notes, etc)
        /// </summary>
        public string Type { get; set; } = "CoSold";
        
        /// <summary>
        /// Last updated timestamp for cache invalidation
        /// </summary>
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual Perfume? SourcePerfume { get; set; }
        public virtual Perfume? RecommendedPerfume { get; set; }
    }
}
