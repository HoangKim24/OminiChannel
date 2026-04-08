using Omnichannel.Infrastructure;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Omnichannel.Services
{
    public class OmnichannelBackgroundSyncService
    {
        private readonly IUnitOfWork _uow;
        private readonly IEnumerable<IOmnichannelAdapter> _adapters;
        private readonly ILogger<OmnichannelBackgroundSyncService> _logger;

        public OmnichannelBackgroundSyncService(
            IUnitOfWork uow,
            IEnumerable<IOmnichannelAdapter> adapters,
            ILogger<OmnichannelBackgroundSyncService> logger)
        {
            _uow = uow;
            _adapters = adapters;
            _logger = logger;
        }

        public async Task SyncInventoryJobAsync(int perfumeId)
        {
            // Hangfire job should always fetch latest from DB 
            var perfume = await _uow.Perfumes.GetByIdAsync(perfumeId);
            if (perfume == null) 
            {
                _logger.LogInformation("[{Job}] Không tìm thấy sản phẩm ID {PerfumeId}", "Hangfire Job", perfumeId);
                return;
            }

            _logger.LogInformation(
                "[{Job}] Bắt đầu đồng bộ tồn kho cho sản phẩm {Name} - Tồn kho: {Stock}",
                "Hangfire Job",
                perfume.Name,
                perfume.StockQuantity);
            
            foreach (var adapter in _adapters)
            {
                await adapter.SyncInventoryAsync(perfume);
            }
            
            _logger.LogInformation("[{Job}] Hoàn tất đồng bộ sản phẩm {Name}", "Hangfire Job", perfume.Name);
        }
    }
}
