using System;
using System.Collections.Generic;

namespace Omnichannel.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Pending";
        public string ShippingAddress { get; set; } = string.Empty;
        public string ReceiverPhone { get; set; } = string.Empty;
        public string? Note { get; set; }
        public bool IsPickup { get; set; } = false;
        public List<OrderItem> Items { get; set; } = new List<OrderItem>();
    }

    public class PlaceOrderRequest
    {
        public int UserId { get; set; }
        public int PerfumeId { get; set; }
        public int Quantity { get; set; }
        public string ShippingAddress { get; set; } = string.Empty;
        public string ReceiverPhone { get; set; } = string.Empty;
        public string? Note { get; set; }
    }

    public class OrderItem
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int PerfumeId { get; set; }
        public string PerfumeName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }

    public class UpdateOrderStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}
