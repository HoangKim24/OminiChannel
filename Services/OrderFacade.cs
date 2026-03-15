using Omnichannel.Infrastructure;
using System.Threading.Tasks;

namespace Omnichannel.Services
{
    public class OrderFacade
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPaymentStrategy _paymentStrategy;
        private readonly InventorySubject _inventorySubject;

        public OrderFacade(IUnitOfWork unitOfWork, IPaymentStrategy paymentStrategy, InventorySubject inventorySubject)
        {
            _unitOfWork = unitOfWork;
            _paymentStrategy = paymentStrategy;
            _inventorySubject = inventorySubject;
        }

        public async Task<bool> PlaceOrderAsync(int perfumeId, int quantity)
        {
            var perfume = await _unitOfWork.Perfumes.GetByIdAsync(perfumeId);
            if (perfume == null || perfume.StockQuantity < quantity) return false;

            // 1. Calculate Price
            var amount = perfume.Price * quantity;

            // 2. Process Payment
            var paymentSuccess = await _paymentStrategy.ProcessPaymentAsync(amount);
            if (!paymentSuccess) return false;

            // 3. Update Inventory
            perfume.StockQuantity -= quantity;
            _unitOfWork.Perfumes.Update(perfume);

            // 4. Notify Omnichannel (Observer)
            await _inventorySubject.NotifyAsync(perfume);

            await _unitOfWork.CompleteAsync();
            return true;
        }
    }
}
