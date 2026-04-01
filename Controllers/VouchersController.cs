using Microsoft.AspNetCore.Mvc;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Omnichannel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VouchersController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public VouchersController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromHeader(Name = "X-User-Role")] string role, CancellationToken cancellationToken)
        {
            if (role != "Admin") return Unauthorized(new { message = "Chỉ Admin mới có quyền xem danh sách mã giảm giá" });
            var vouchers = await _unitOfWork.Vouchers.GetAllAsync(cancellationToken);
            return Ok(vouchers);
        }

        [HttpPost("validate")]
        public async Task<IActionResult> ValidateVoucher([FromBody] ValidateVoucherRequest request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Code)) return BadRequest(new { message = "Voucher code rỗng" });

            var voucher = await _unitOfWork.Vouchers.GetByCodeAsync(request.Code, cancellationToken);
            if (voucher == null || !voucher.IsActive)
                return BadRequest(new { message = "Mã giảm giá không tồn tại hoặc đã bị khóa" });

            if (voucher.ExpiryDate <= DateTime.Now)
                return BadRequest(new { message = "Mã giảm giá đã hết hạn" });

            if (request.TotalAmount < voucher.MinOrderValue)
                return BadRequest(new { message = $"Đơn hàng phải tối thiểu {voucher.MinOrderValue:N0}đ để áp dụng mã này" });

            if (voucher.UsageLimit > 0 && voucher.UsedCount >= voucher.UsageLimit)
                return BadRequest(new { message = "Mã giảm giá đã hết lượt sử dụng" });

            return Ok(new { message = "Mã hợp lệ", discountAmount = voucher.DiscountAmount });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromHeader(Name = "X-User-Role")] string role, [FromBody] Voucher request, CancellationToken cancellationToken)
        {
            if (role != "Admin") return Unauthorized();

            var existing = await _unitOfWork.Vouchers.GetByCodeAsync(request.Code, cancellationToken);
            if (existing != null) return BadRequest(new { message = "Mã code đã tồn tại" });

            await _unitOfWork.Vouchers.AddAsync(request, cancellationToken);
            await _unitOfWork.CompleteAsync(cancellationToken);

            return Created($"/api/vouchers/{request.Id}", request);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, [FromHeader(Name = "X-User-Role")] string role, CancellationToken cancellationToken)
        {
            if (role != "Admin") return Unauthorized();

            var voucher = await _unitOfWork.Vouchers.GetByIdAsync(id, cancellationToken);
            if (voucher == null) return NotFound();

            _unitOfWork.Vouchers.Delete(voucher);
            await _unitOfWork.CompleteAsync(cancellationToken);

            return Ok(new { message = "Đã xóa mã giảm giá" });
        }
    }

    public class ValidateVoucherRequest
    {
        public string Code { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
    }
}
