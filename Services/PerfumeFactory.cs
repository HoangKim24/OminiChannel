using Omnichannel.Models;

namespace Omnichannel.Services
{
    public abstract class PerfumeFactory
    {
        public abstract Perfume CreatePerfume(string name, decimal price);
    }

    public class LuxuryPerfumeFactory : PerfumeFactory
    {
        public override Perfume CreatePerfume(string name, decimal price)
        {
            return new Perfume 
            { 
                Name = name, 
                Price = price, 
                CategoryId = null, // Assign CategoryId after Categories are loaded
                Description = "Sản phẩm cao cấp từ thương hiệu KP." 
            };
        }
    }

    public class StandardPerfumeFactory : PerfumeFactory
    {
        public override Perfume CreatePerfume(string name, decimal price)
        {
            return new Perfume 
            { 
                Name = name, 
                Price = price, 
                CategoryId = null, // Assign CategoryId after Categories are loaded
                Description = "Dòng sản phẩm phổ thông chất lượng của KP." 
            };
        }
    }
}
