using Microsoft.AspNetCore.Mvc;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Omnichannel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PerfumesController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public PerfumesController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Perfume>>> GetPerfumes()
        {
            var perfumes = await _unitOfWork.Perfumes.GetAllAsync();
            return Ok(perfumes);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Perfume>> GetPerfume(int id)
        {
            var perfume = await _unitOfWork.Perfumes.GetByIdAsync(id);
            if (perfume == null) return NotFound(new { message = $"Sản phẩm ID={id} không tồn tại" });
            return Ok(perfume);
        }

        [HttpPost]
        public async Task<ActionResult<Perfume>> CreatePerfume(
            [FromHeader(Name = "X-User-Role")] string role,
            [FromBody] Perfume perfume)
        {
            try
            {
                var proxy = new Services.SecurityProxy(new Services.AdminService(_unitOfWork), role);
                await proxy.CreateProductAsync(perfume);
                return CreatedAtAction(nameof(GetPerfume), new { id = perfume.Id }, perfume);
            }
            catch (UnauthorizedAccessException)
            {
                return StatusCode(403, new { message = "Chỉ Admin mới có quyền tạo sản phẩm" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi tạo sản phẩm", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePerfume(int id, [FromHeader(Name = "X-User-Role")] string role, [FromBody] Perfume perfume)
        {
            if (id != perfume.Id) return BadRequest(new { message = "ID không khớp" });

            try
            {
                var existing = await _unitOfWork.Perfumes.GetByIdAsync(id);
                if (existing == null) return NotFound(new { message = $"Sản phẩm ID={id} không tồn tại" });

                var proxy = new Services.SecurityProxy(new Services.AdminService(_unitOfWork), role);
                await proxy.UpdateProductAsync(perfume);
                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return StatusCode(403, new { message = "Chỉ Admin mới có quyền cập nhật sản phẩm" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi cập nhật sản phẩm", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePerfume(int id, [FromHeader(Name = "X-User-Role")] string role)
        {
            try
            {
                var proxy = new Services.SecurityProxy(new Services.AdminService(_unitOfWork), role);
                var success = await proxy.DeleteProductAsync(id);
                if (!success) return NotFound(new { message = $"Sản phẩm ID={id} không tồn tại" });
                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return StatusCode(403, new { message = "Chỉ Admin mới có quyền xóa sản phẩm" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi xóa sản phẩm", error = ex.Message });
            }
        }
        [HttpPost("recommend")]
        public async Task<IActionResult> Recommend([FromBody] Services.RecommendationRequest req, [FromServices] Services.RecommendationService rcService)
        {
            var data = await rcService.GetRecommendationsAsync(req, 5);
            return Ok(data);
        }
    }
}
