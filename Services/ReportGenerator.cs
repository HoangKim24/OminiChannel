using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Omnichannel.Infrastructure;
using Omnichannel.Models;

namespace Omnichannel.Services
{
    // Template Method Pattern
    public abstract class ReportGenerator
    {
        protected readonly IUnitOfWork _unitOfWork;

        protected ReportGenerator(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<object> GenerateReportAsync()
        {
            var data = await FetchDataAsync();
            var processed = ProcessData(data);
            return FormatReport(processed);
        }

        protected abstract Task<List<decimal>> FetchDataAsync();
        protected abstract List<decimal> ProcessData(List<decimal> raw);
        
        protected virtual object FormatReport(List<decimal> data)
        {
            return new { 
                timestamp = DateTime.UtcNow,
                data = data,
                total = data.Sum()
            };
        }
    }

    public class SalesReportGenerator : ReportGenerator
    {
        public SalesReportGenerator(IUnitOfWork unitOfWork) : base(unitOfWork) { }

        protected override async Task<List<decimal>> FetchDataAsync()
        {
            var orders = await _unitOfWork.Orders.GetAllAsync();
            return orders.Select(o => o.TotalAmount).ToList();
        }

        protected override List<decimal> ProcessData(List<decimal> raw) => raw;
    }

    public class StockReportGenerator : ReportGenerator
    {
        public StockReportGenerator(IUnitOfWork unitOfWork) : base(unitOfWork) { }

        protected override async Task<List<decimal>> FetchDataAsync()
        {
            var perfumes = await _unitOfWork.Perfumes.GetAllAsync();
            return perfumes.Select(p => (decimal)p.StockQuantity).ToList();
        }

        protected override List<decimal> ProcessData(List<decimal> raw)
        {
            raw.Sort();
            return raw;
        }
    }
}
