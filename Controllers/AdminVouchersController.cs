using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using Swashbuckle.AspNetCore.Annotations;

namespace Omnichannel.Controllers
{
    [ApiController]
    [Route("api/admin/vouchers")]
    [Authorize(Roles = "Admin")]
    public class AdminVouchersController : ControllerBase
    {
        private readonly OmnichannelDbContext _context;

        public AdminVouchersController(OmnichannelDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [SwaggerOperation(Summary = "Lấy danh sách voucher (admin)", Description = "API dành cho admin để lấy toàn bộ voucher kèm dữ liệu sử dụng và phạm vi kênh bán.")]
        [ProducesResponseType(typeof(List<VoucherResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var vouchers = await _context.Vouchers
                .AsNoTracking()
                .Include(v => v.SalesChannel)
                .OrderByDescending(v => v.Id)
                .Select(v => new VoucherResponse
                {
                    Id = v.Id,
                    Code = v.Code,
                    Name = v.Name,
                    Description = v.Description,
                    VoucherType = v.VoucherType,
                    DiscountType = v.DiscountType,
                    DiscountValue = v.DiscountValue,
                    MaxDiscountAmount = v.MaxDiscountAmount,
                    MinOrderValue = v.MinOrderValue,
                    StartAt = v.StartAt,
                    EndAt = v.EndAt,
                    UsageLimitTotal = v.UsageLimitTotal,
                    UsageLimitPerUser = v.UsageLimitPerUser,
                    SalesChannelId = v.SalesChannelId,
                    SalesChannelName = v.SalesChannel != null ? v.SalesChannel.ChannelName : null,
                    IsActive = v.IsActive,
                    IsDeleted = v.IsDeleted,
                    TotalRedemptions = _context.VoucherRedemptions.Count(r => r.VoucherId == v.Id)
                })
                .ToListAsync(cancellationToken);

            return Ok(vouchers);
        }

        [HttpPost]
        [SwaggerOperation(Summary = "Tạo voucher (admin)", Description = "API dành cho admin để tạo voucher. Hỗ trợ loại đơn hàng/vận chuyển và kiểu phần trăm/số tiền cố định.")]
        [ProducesResponseType(typeof(Voucher), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Create([FromBody] VoucherUpsertRequest request, CancellationToken cancellationToken)
        {
            var normalizedCode = request.Code.Trim().ToUpperInvariant();
            var existing = await _context.Vouchers.AnyAsync(v => v.Code == normalizedCode, cancellationToken);
            if (existing) return BadRequest(new { message = "Mã code đã tồn tại" });

            var voucher = new Voucher
            {
                Code = normalizedCode,
                Name = request.Name.Trim(),
                Description = request.Description,
                VoucherType = request.VoucherType,
                DiscountType = request.DiscountType,
                DiscountValue = request.DiscountValue,
                MaxDiscountAmount = request.MaxDiscountAmount,
                MinOrderValue = request.MinOrderValue,
                StartAt = request.StartAt,
                EndAt = request.EndAt,
                UsageLimitTotal = request.UsageLimitTotal,
                UsageLimitPerUser = request.UsageLimitPerUser,
                SalesChannelId = request.SalesChannelId,
                IsActive = request.IsActive,
                IsDeleted = false
            };

            await _context.Vouchers.AddAsync(voucher, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            return Created($"/api/admin/vouchers/{voucher.Id}", voucher);
        }

        [HttpPut("{id}")]
        [SwaggerOperation(Summary = "Cập nhật voucher (admin)", Description = "API dành cho admin để cập nhật điều kiện, giới hạn, trạng thái hoạt động và phạm vi kênh bán của voucher.")]
        [ProducesResponseType(typeof(Voucher), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] VoucherUpsertRequest request, CancellationToken cancellationToken)
        {
            var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Id == id, cancellationToken);
            if (voucher == null) return NotFound(new { message = "Voucher không tồn tại" });

            var normalizedCode = request.Code.Trim().ToUpperInvariant();
            var duplicate = await _context.Vouchers.AnyAsync(v => v.Id != id && v.Code == normalizedCode, cancellationToken);
            if (duplicate) return BadRequest(new { message = "Mã code đã tồn tại" });

            voucher.Code = normalizedCode;
            voucher.Name = request.Name.Trim();
            voucher.Description = request.Description;
            voucher.VoucherType = request.VoucherType;
            voucher.DiscountType = request.DiscountType;
            voucher.DiscountValue = request.DiscountValue;
            voucher.MaxDiscountAmount = request.MaxDiscountAmount;
            voucher.MinOrderValue = request.MinOrderValue;
            voucher.StartAt = request.StartAt;
            voucher.EndAt = request.EndAt;
            voucher.UsageLimitTotal = request.UsageLimitTotal;
            voucher.UsageLimitPerUser = request.UsageLimitPerUser;
            voucher.SalesChannelId = request.SalesChannelId;
            voucher.IsActive = request.IsActive;
            voucher.IsDeleted = false;

            await _context.SaveChangesAsync(cancellationToken);
            return Ok(voucher);
        }

        [HttpDelete("{id}")]
        [SwaggerOperation(Summary = "Vô hiệu hóa voucher (admin)", Description = "API dành cho admin để vô hiệu hóa mềm voucher bằng cách đặt IsActive=false và IsDeleted=true.")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Id == id, cancellationToken);
            if (voucher == null) return NotFound(new { message = "Voucher không tồn tại" });

            voucher.IsActive = false;
            voucher.IsDeleted = true;
            await _context.SaveChangesAsync(cancellationToken);

            return Ok(new { message = "Đã vô hiệu hóa voucher" });
        }
    }
}