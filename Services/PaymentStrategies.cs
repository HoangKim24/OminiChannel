using System.Threading.Tasks;

namespace Omnichannel.Services
{
    public interface IPaymentStrategy
    {
        Task<bool> ProcessPaymentAsync(decimal amount);
    }

    public class CreditCardPayment : IPaymentStrategy
    {
        public async Task<bool> ProcessPaymentAsync(decimal amount)
        {
            // Simulating CC processing
            return await Task.FromResult(true);
        }
    }

    public class EWalletPayment : IPaymentStrategy
    {
        public async Task<bool> ProcessPaymentAsync(decimal amount)
        {
            // Simulating E-Wallet processing (Momo, ZaloPay, etc.)
            return await Task.FromResult(true);
        }
    }
}
