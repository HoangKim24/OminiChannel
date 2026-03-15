using Omnichannel.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

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

        public async Task NotifyAsync(Perfume perfume)
        {
            foreach (var observer in _observers)
            {
                await observer.OnInventoryChangedAsync(perfume);
            }
        }
    }

    public class OmnichannelSyncObserver : IInventoryObserver
    {
        private readonly IEnumerable<IOmnichannelAdapter> _adapters;

        public OmnichannelSyncObserver(IEnumerable<IOmnichannelAdapter> adapters)
        {
            _adapters = adapters;
        }

        public async Task OnInventoryChangedAsync(Perfume perfume)
        {
            System.Console.WriteLine($"[Observer] Phát hiện thay đổi tồn kho: '{perfume.Name}' → {perfume.StockQuantity}. Đang đồng bộ đến tất cả kênh...");
            foreach (var adapter in _adapters)
            {
                await adapter.SyncInventoryAsync(perfume);
            }
            System.Console.WriteLine($"[Observer] Hoàn tất đồng bộ '{perfume.Name}' đến {System.Linq.Enumerable.Count(_adapters)} kênh.");
        }
    }
}
