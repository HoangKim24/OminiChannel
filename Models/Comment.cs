using System;

namespace Omnichannel.Models
{
    public class Comment
    {
        public int Id { get; set; }
        public int PerfumeId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int Stars { get; set; }
        public string Text { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public bool IsVerified { get; set; } = false;
    }
}
