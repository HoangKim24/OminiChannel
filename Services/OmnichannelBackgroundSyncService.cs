using Omnichannel.Infrastructure;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Omnichannel.Services
{
    public class OmnichannelBackgroundSyncService
    {
        private readonly IUnitOfWork _uow;
        private readonly IEnumerable<IOmnichannelAdapter> _adapters;

        public OmnichannelBackgroundSyncService(IUnitOfWork uow, IEnumerable<IOmnichannelAdapter> adapters)
        {
            _uow = uow;
            _adapters = adapters;
        }

        public async Task SyncInventoryJobAsync(int perfumeId)
        {
            // Hangfire job should always fetch latest from DB 
            var perfume = await _uow.Perfumes.GetByIdAsync(perfumeId);
            if (perfume == null) 
            {
                System.Console.WriteLine($"[Hangfire Job] Không tìm thấy sản phẩm ID {perfumeId}");
                return;
            }

            System.Console.WriteLine($"[Hangfire Job] Bắt đầu đồng bộ tồn kho cho: '{perfume.Name}' (Hiện có: {perfume.StockQuantity})...");
            
            foreach (var adapter in _adapters)
            {
                await adapter.SyncInventoryAsync(perfume);
            }
            
            System.Console.WriteLine($"[Hangfire Job] Hoàn tất đồng bộ '{perfume.Name}'.");
        }
    }
}
