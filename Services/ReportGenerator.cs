using System;
using System.Collections.Generic;

namespace Omnichannel.Services
{
    // Template Method Pattern
    public abstract class ReportGenerator
    {
        // The Template Method
        public object GenerateReport()
        {
            var data = FetchData();
            var processed = ProcessData(data);
            return FormatReport(processed);
        }

        protected abstract List<int> FetchData();
        protected abstract List<int> ProcessData(List<int> raw);
        
        protected virtual object FormatReport(List<int> data)
        {
            return new { 
                timestamp = DateTime.Now,
                data = data,
                total = data.Count > 0 ? 1000 : 0 // Mock total
            };
        }
    }

    public class SalesReportGenerator : ReportGenerator
    {
        protected override List<int> FetchData() => new List<int> { 100, 200, 150, 300, 250 }; // Mock sales
        protected override List<int> ProcessData(List<int> raw) => raw; // Simple pass through
    }

    public class StockReportGenerator : ReportGenerator
    {
        protected override List<int> FetchData() => new List<int> { 50, 30, 100, 10, 5 }; // Mock stock
        protected override List<int> ProcessData(List<int> raw)
        {
            raw.Sort(); // Sort stock low to high
            return raw;
        }
    }
}
