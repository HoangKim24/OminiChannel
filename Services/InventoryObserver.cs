using Omnichannel.Models;
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

        public OmnichannelSyncObserver(Hangfire.IBackgroundJobClient backgroundJobClient)
        {
            _backgroundJobClient = backgroundJobClient;
        }

        public Task OnInventoryChangedAsync(Perfume perfume)
        {
            System.Console.WriteLine($"[Observer] Phát hiện thay đổi tồn kho: '{perfume.Name}'. Đẩy việc đồng bộ vào Hàng đợi siêu tốc (Hangfire) để khách không phải chờ...");
            
            _backgroundJobClient.Enqueue<OmnichannelBackgroundSyncService>(service => service.SyncInventoryJobAsync(perfume.Id));
            
            return Task.CompletedTask;
        }
    }
}
