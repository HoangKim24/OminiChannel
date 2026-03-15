using Microsoft.AspNetCore.Mvc;
using Omnichannel.Services;

namespace Omnichannel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatisticsController : ControllerBase
    {
        [HttpGet("sales")]
        public IActionResult GetSalesStats([FromHeader(Name = "X-User-Role")] string role)
        {
            if (role != "Admin") return Unauthorized();
            var report = new SalesReportGenerator().GenerateReport();
            return Ok(report);
        }

        [HttpGet("stock")]
        public IActionResult GetStockStats([FromHeader(Name = "X-User-Role")] string role)
        {
            if (role != "Admin") return Unauthorized();
            var report = new StockReportGenerator().GenerateReport();
            return Ok(report);
        }
    }
}
