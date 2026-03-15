namespace Omnichannel.Services
{
    public interface IPricingStrategy
    {
        decimal CalculatePrice(decimal basePrice);
    }

    public class BasePricingStrategy : IPricingStrategy
    {
        public decimal CalculatePrice(decimal basePrice) => basePrice;
    }

    public abstract class PricingDecorator : IPricingStrategy
    {
        protected readonly IPricingStrategy _pricingStrategy;

        protected PricingDecorator(IPricingStrategy pricingStrategy)
        {
            _pricingStrategy = pricingStrategy;
        }

        public abstract decimal CalculatePrice(decimal basePrice);
    }

    public class DiscountDecorator : PricingDecorator
    {
        private readonly decimal _discountPercentage;

        public DiscountDecorator(IPricingStrategy pricingStrategy, decimal discountPercentage) 
            : base(pricingStrategy)
        {
            _discountPercentage = discountPercentage;
        }

        public override decimal CalculatePrice(decimal basePrice)
        {
            var price = _pricingStrategy.CalculatePrice(basePrice);
            return price * (1 - _discountPercentage / 100);
        }
    }

    public class TaxDecorator : PricingDecorator
    {
        private readonly decimal _taxPercentage;

        public TaxDecorator(IPricingStrategy pricingStrategy, decimal taxPercentage) 
            : base(pricingStrategy)
        {
            _taxPercentage = taxPercentage;
        }

        public override decimal CalculatePrice(decimal basePrice)
        {
            var price = _pricingStrategy.CalculatePrice(basePrice);
            return price * (1 + _taxPercentage / 100);
        }
    }
}
