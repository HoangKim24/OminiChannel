using Omnichannel.Models;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;
using Hangfire;

namespace Omnichannel.Services
{
    public interface IInventoryObserver
    {
        Task OnInventoryChangedAsync(Perfume perfume);
    }

    public class InventorySubject
    {
        private readonly List<IInventoryObserver> _observers = new List<IInventoryObserver>();

        public void Attach(IInventoryObserver observer) => _observers.Add(observer);
        public void Detach(IInventoryObserver observer) => _observers.Remove(observer);

        public virtual async Task NotifyAsync(Perfume perfume)
        {
            foreach (var observer in _observers)
            {
                await observer.OnInventoryChangedAsync(perfume);
            }
        }
    }

    public class OmnichannelSyncObserver : IInventoryObserver
    {
        private readonly Hangfire.IBackgroundJobClient _backgroundJobClient;
        private readonly ILogger<OmnichannelSyncObserver> _logger;

        public OmnichannelSyncObserver(Hangfire.IBackgroundJobClient backgroundJobClient, ILogger<OmnichannelSyncObserver> logger)
        {
            _backgroundJobClient = backgroundJobClient;
            _logger = logger;
        }

        public Task OnInventoryChangedAsync(Perfume perfume)
        {
            _logger.LogInformation(
                "[{Component}] Phát hiện thay đổi tồn kho cho sản phẩm {Name} - Tồn kho: {Stock}. Đẩy job đồng bộ vào hàng đợi",
                "Observer",
                perfume.Name,
                perfume.StockQuantity);
            
            _backgroundJobClient.Enqueue<OmnichannelBackgroundSyncService>(service => service.SyncInventoryJobAsync(perfume.Id));
            
            return Task.CompletedTask;
        }
    }
}
