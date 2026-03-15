using Omnichannel.Models;
using System;
using System.Threading.Tasks;

namespace Omnichannel.Services
{
    // External interfaces (Simplified)
    public interface IShopeeApi { Task UpdateStock(int id, int qty); }
    public interface ITikTokApi { Task SyncProduct(int code, int count); }

    // Adapter Interface
    public interface IOmnichannelAdapter
    {
        string ChannelName { get; }
        Task SyncInventoryAsync(Perfume perfume);
    }

    public class ShopeeAdapter : IOmnichannelAdapter
    {
        public string ChannelName => "Shopee";
        public async Task SyncInventoryAsync(Perfume perfume)
        {
            Console.WriteLine($"[Shopee] Đồng bộ sản phẩm '{perfume.Name}' - Tồn kho: {perfume.StockQuantity} - Giá: {perfume.Price:C}");
            await Task.CompletedTask;
        }
    }

    public class TikTokAdapter : IOmnichannelAdapter
    {
        public string ChannelName => "TikTok Shop";
        public async Task SyncInventoryAsync(Perfume perfume)
        {
            Console.WriteLine($"[TikTok Shop] Đồng bộ sản phẩm '{perfume.Name}' - Tồn kho: {perfume.StockQuantity} - Giá: {perfume.Price:C}");
            await Task.CompletedTask;
        }
    }

    public class LazadaAdapter : IOmnichannelAdapter
    {
        public string ChannelName => "Lazada";
        public async Task SyncInventoryAsync(Perfume perfume)
        {
            Console.WriteLine($"[Lazada] Đồng bộ sản phẩm '{perfume.Name}' - Tồn kho: {perfume.StockQuantity} - Giá: {perfume.Price:C}");
            await Task.CompletedTask;
        }
    }
}
