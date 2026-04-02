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
        private readonly Services.IRecommendationFacade _recommendationFacade;

        public PerfumesController(IUnitOfWork unitOfWork, Services.IRecommendationFacade recommendationFacade)
        {
            _unitOfWork = unitOfWork;
            _recommendationFacade = recommendationFacade;
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
            var data = await rcService.GetRecommendationsByNotesAsync(req, 5);
            return Ok(data);
        }

        /// <summary>
        /// GET /api/perfumes/{id}/recommendations
        /// Get product recommendations for a specific perfume
        /// Uses combined algorithm: co-occurrence + related products
        /// </summary>
        [HttpGet("{id}/recommendations")]
        public async Task<ActionResult<List<Services.PerfumeBasicDto>>> GetProductRecommendations(int id, [FromQuery] int limit = 5)
        {
            try
            {
                var recommendations = await _recommendationFacade.GetProductRecommendationsAsync(id, limit);
                return Ok(new
                {
                    perfumeId = id,
                    recommendations = recommendations,
                    count = recommendations.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy gợi ý sản phẩm", error = ex.Message });
            }
        }

        /// <summary>
        /// POST /api/perfumes/recommend-by-preferences
        /// Get recommendations based on customer preferences (notes, gender, etc.)
        /// </summary>
        [HttpPost("recommend-by-preferences")]
        public async Task<ActionResult<List<Services.RecommendedPerfumeDto>>> GetPreferenceRecommendations(
            [FromBody] Services.RecommendationRequest request,
            [FromQuery] int limit = 5)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { message = "Yêu cầu không hợp lệ" });

                var recommendations = await _recommendationFacade.GetPreferenceBasedRecommendationsAsync(request, limit);
                return Ok(new
                {
                    recommendations = recommendations,
                    count = recommendations.Count,
                    request = request
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy gợi ý theo sở thích", error = ex.Message });
            }
        }
    }
}
