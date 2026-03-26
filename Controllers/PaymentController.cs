using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using Omnichannel.Services;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Omnichannel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly OmnichannelDbContext _context;

        public PaymentController(OmnichannelDbContext context)
        {
            _context = context;
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
        public async Task<IActionResult> VNPayReturn([FromQuery] string vnp_TxnRef, [FromQuery] string vnp_ResponseCode, [FromQuery] string vnp_SecureHash)
        {
            if (int.TryParse(vnp_TxnRef, out int orderId))
            {
                var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == orderId);
                if (order != null)
                {
                    if (vnp_ResponseCode == "00")
                    {
                        order.Status = "Paid";
                        await _context.SaveChangesAsync();
                        return Redirect("http://localhost:5173/payment-success");
                    }
                    else
                    {
                        order.Status = "Payment Failed";
                        await _context.SaveChangesAsync();
                        return Redirect("http://localhost:5173/payment-failed");
                    }
                }
            }

            return BadRequest("Data sai lệch");
        }
    }
}
