using Omnichannel.Infrastructure;
using Omnichannel.Models;
using System;
using System.Collections.Generic;
using System.Threading;
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

        public async Task<(bool Success, string PaymentUrl, Order? CreatedOrder)> PlaceOrderAsync(PlaceOrderRequest request, CancellationToken cancellationToken = default)
        {
            var perfume = await _unitOfWork.Perfumes.GetByIdAsync(request.PerfumeId, cancellationToken);
            if (perfume == null || perfume.StockQuantity < request.Quantity) return (false, string.Empty, null);

            var totalAmount = perfume.Price * request.Quantity;

            var order = new Order
            {
                UserId = request.UserId,
                OrderDate = DateTime.Now,
                Status = "Pending",
                TotalAmount = totalAmount,
                ShippingAddress = request.ShippingAddress,
                ReceiverPhone = request.ReceiverPhone,
                Note = request.Note,
                Items = new List<OrderItem>
                {
                    new OrderItem
                    {
                        PerfumeId = perfume.Id,
                        PerfumeName = perfume.Name,
                        Quantity = request.Quantity,
                        Price = perfume.Price
                    }
                }
            };

            await _unitOfWork.Orders.AddAsync(order, cancellationToken);
            
            // Saving first to persist the Order and get an ID for Payment integration
            await _unitOfWork.CompleteAsync(cancellationToken);

            // 2. Process Payment
            var paymentUrl = await _paymentStrategy.ProcessPaymentAsync(order);

            // 3. Update Inventory
            perfume.StockQuantity -= request.Quantity;
            _unitOfWork.Perfumes.Update(perfume);

            // 4. Notify Omnichannel (Observer)
            await _inventorySubject.NotifyAsync(perfume);

            await _unitOfWork.CompleteAsync(cancellationToken);
            
            return (true, paymentUrl, order);
        }
    }
}
