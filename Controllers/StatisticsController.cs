using Microsoft.AspNetCore.Mvc;
using Omnichannel.Services;
using Omnichannel.Infrastructure;
using System.Threading.Tasks;

namespace Omnichannel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatisticsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public StatisticsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet("sales")]
        public async Task<IActionResult> GetSalesStats([FromHeader(Name = "X-User-Role")] string role)
        {
            if (role != "Admin") return Unauthorized();
            var report = await new SalesReportGenerator(_unitOfWork).GenerateReportAsync();
            return Ok(report);
        }

        [HttpGet("stock")]
        public async Task<IActionResult> GetStockStats([FromHeader(Name = "X-User-Role")] string role)
        {
            if (role != "Admin") return Unauthorized();
            var report = await new StockReportGenerator(_unitOfWork).GenerateReportAsync();
            return Ok(report);
        }
    }
}
