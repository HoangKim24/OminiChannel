using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using Omnichannel.Services;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Omnichannel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly OmnichannelDbContext _context;
        private readonly IConfiguration _configuration;

        public PaymentController(OmnichannelDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("create-payment-url/{orderId}")]
        public async Task<IActionResult> CreatePaymentUrl(int orderId, [FromServices] VNPayStrategy vnPayStrategy)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null) return NotFound("Order không tồn tại.");

            var paymentUrl = await vnPayStrategy.ProcessPaymentAsync(order);

            return Ok(new { Url = paymentUrl });
        }

        [HttpGet("vnpay-return")]
        public async Task<IActionResult> VNPayReturn([FromQuery] string vnp_TxnRef, [FromQuery] string vnp_ResponseCode, [FromServices] VNPayStrategy vnPayStrategy)
        {
            if (!vnPayStrategy.VerifyReturnSignature(Request.Query))
            {
                return BadRequest("Sai chữ ký bảo mật VNPay");
            }

            var frontEndBaseUrl = _configuration["Frontend:BaseUrl"] ?? "http://localhost:5173";

            if (int.TryParse(vnp_TxnRef, out int orderId))
            {
                var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == orderId);
                if (order != null)
                {
                    if (vnp_ResponseCode == "00")
                    {
                        order.Status = "Paid";
                        await _context.SaveChangesAsync();
                        return Redirect($"{frontEndBaseUrl}/payment-success");
                    }
                    else
                    {
                        order.Status = "Payment Failed";
                        await _context.SaveChangesAsync();
                        return Redirect($"{frontEndBaseUrl}/payment-failed");
                    }
                }
            }

            return BadRequest("Data sai lệch");
        }
    }
}
