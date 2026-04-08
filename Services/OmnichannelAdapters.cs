using Omnichannel.Models;
using Microsoft.Extensions.Logging;
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
        private readonly ILogger<ShopeeAdapter> _logger;

        public ShopeeAdapter(ILogger<ShopeeAdapter> logger)
        {
            _logger = logger;
        }

        public string ChannelName => "Shopee";
        public async Task SyncInventoryAsync(Perfume perfume)
        {
            _logger.LogInformation(
                "[{Channel}] Đồng bộ sản phẩm {Name} - Tồn kho: {Stock} - Giá: {Price}",
                "Shopee",
                perfume.Name,
                perfume.StockQuantity,
                perfume.Price);
            await Task.CompletedTask;
        }
    }

    public class TikTokAdapter : IOmnichannelAdapter
    {
        private readonly ILogger<TikTokAdapter> _logger;

        public TikTokAdapter(ILogger<TikTokAdapter> logger)
        {
            _logger = logger;
        }

        public string ChannelName => "TikTok Shop";
        public async Task SyncInventoryAsync(Perfume perfume)
        {
            _logger.LogInformation(
                "[{Channel}] Đồng bộ sản phẩm {Name} - Tồn kho: {Stock} - Giá: {Price}",
                "TikTok Shop",
                perfume.Name,
                perfume.StockQuantity,
                perfume.Price);
            await Task.CompletedTask;
        }
    }

    public class LazadaAdapter : IOmnichannelAdapter
    {
        private readonly ILogger<LazadaAdapter> _logger;

        public LazadaAdapter(ILogger<LazadaAdapter> logger)
        {
            _logger = logger;
        }

        public string ChannelName => "Lazada";
        public async Task SyncInventoryAsync(Perfume perfume)
        {
            _logger.LogInformation(
                "[{Channel}] Đồng bộ sản phẩm {Name} - Tồn kho: {Stock} - Giá: {Price}",
                "Lazada",
                perfume.Name,
                perfume.StockQuantity,
                perfume.Price);
            await Task.CompletedTask;
        }
    }
}
