using Microsoft.AspNetCore.Mvc;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using Omnichannel.Services;
using System;
using System.Threading.Tasks;
using Swashbuckle.AspNetCore.Annotations;
using Microsoft.EntityFrameworkCore;

namespace Omnichannel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VouchersController : ControllerBase
    {
        private readonly VoucherPricingService _voucherPricingService;
        private readonly OmnichannelDbContext _context;

        public VouchersController(VoucherPricingService voucherPricingService, OmnichannelDbContext context)
        {
            _voucherPricingService = voucherPricingService;
            _context = context;
        }

        [HttpGet("active-list")]
        [SwaggerOperation(
            Summary = "Lấy danh sách voucher đang hoạt động",
            Description = "API cho checkout lấy danh sách mã giảm giá khả dụng để người dùng chọn nhanh.")]
        [ProducesResponseType(typeof(List<PublicVoucherListItemResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetActiveList(CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;

            var items = await _context.Vouchers
                .AsNoTracking()
                .Where(v => v.IsActive && !v.IsDeleted && v.StartAt <= now && v.EndAt >= now)
                .OrderBy(v => v.VoucherType)
                .ThenBy(v => v.Code)
                .Select(v => new PublicVoucherListItemResponse
                {
                    Code = v.Code,
                    Name = v.Name,
                    Description = v.Description,
                    VoucherType = v.VoucherType,
                    DiscountType = v.DiscountType,
                    DiscountValue = v.DiscountValue,
                    MaxDiscountAmount = v.MaxDiscountAmount,
                    MinOrderValue = v.MinOrderValue,
                    EndAt = v.EndAt
                })
                .ToListAsync(cancellationToken);

            return Ok(items);
        }

        [HttpGet("validate")]
        [SwaggerOperation(
            Summary = "Kiểm tra mã giảm giá",
            Description = "API cho người dùng kiểm tra mã giảm giá. Cách gọi tối thiểu: /api/vouchers/validate?code=WELCOME10. " +
                          "Để kiểm tra theo giỏ hàng thực tế, truyền thêm userId/itemsSubtotal/shippingFee/salesChannelId.")]
        [ProducesResponseType(typeof(VoucherValidationResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(VoucherValidationResponse), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Validate([FromQuery] VoucherLookupRequest request, CancellationToken cancellationToken)
        {
            var result = await _voucherPricingService.ValidateAsync(request, cancellationToken);
            if (!result.IsValid)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost("apply")]
        [SwaggerOperation(
            Summary = "Áp dụng mã giảm giá và trả về bảng tính",
            Description = "API cho người dùng áp dụng một hoặc hai mã giảm giá và trả về chi tiết tính tiền: itemsSubtotal, shippingFee, orderVoucherDiscount, shippingVoucherDiscount, finalTotal. " +
                          "Ví dụ body: { userId: 2, itemsSubtotal: 1200000, shippingFee: 50000, orderVoucherCode: 'WELCOME10', shippingVoucherCode: 'SHIP20K', salesChannelId: 1 }")]
        [ProducesResponseType(typeof(VoucherApplyResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Apply([FromBody] VoucherApplyRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _voucherPricingService.ApplyAsync(request, cancellationToken);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
