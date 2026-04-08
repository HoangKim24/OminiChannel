using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Hosting;
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
        private readonly IHostEnvironment _hostEnvironment;

        public PerfumesController(IUnitOfWork unitOfWork, Services.IRecommendationFacade recommendationFacade, IHostEnvironment hostEnvironment)
        {
            _unitOfWork = unitOfWork;
            _recommendationFacade = recommendationFacade;
            _hostEnvironment = hostEnvironment;
        }

        private string GetSafeErrorDetail(Exception ex)
        {
            return _hostEnvironment.IsDevelopment()
                ? ex.Message
                : "Đã xảy ra lỗi, vui lòng thử lại sau";
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
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Perfume>> CreatePerfume([FromBody] Perfume perfume)
        {
            try
            {
                var adminService = new Services.AdminService(_unitOfWork);
                await adminService.CreateProductAsync(perfume);
                return CreatedAtAction(nameof(GetPerfume), new { id = perfume.Id }, perfume);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi tạo sản phẩm", error = GetSafeErrorDetail(ex) });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdatePerfume(int id, [FromBody] Perfume perfume)
        {
            if (id != perfume.Id) return BadRequest(new { message = "ID không khớp" });

            try
            {
                var existing = await _unitOfWork.Perfumes.GetByIdAsync(id);
                if (existing == null) return NotFound(new { message = $"Sản phẩm ID={id} không tồn tại" });

                var adminService = new Services.AdminService(_unitOfWork);
                await adminService.UpdateProductAsync(perfume);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi cập nhật sản phẩm", error = GetSafeErrorDetail(ex) });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePerfume(int id)
        {
            try
            {
                var adminService = new Services.AdminService(_unitOfWork);
                var success = await adminService.DeleteProductAsync(id);
                if (!success) return NotFound(new { message = $"Sản phẩm ID={id} không tồn tại" });
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi xóa sản phẩm", error = GetSafeErrorDetail(ex) });
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
                return StatusCode(500, new { message = "Lỗi khi lấy gợi ý sản phẩm", error = GetSafeErrorDetail(ex) });
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
                return StatusCode(500, new { message = "Lỗi khi lấy gợi ý theo sở thích", error = GetSafeErrorDetail(ex) });
            }
        }
    }
}
