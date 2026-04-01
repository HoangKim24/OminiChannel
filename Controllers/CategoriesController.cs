using Microsoft.AspNetCore.Mvc;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
using System.Threading;
using System.Threading.Tasks;

namespace Omnichannel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public CategoriesController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var categories = await _unitOfWork.Categories.GetAllAsync(cancellationToken);
            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(id, cancellationToken);
            if (category == null) return NotFound(new { message = $"Không tìm thấy danh mục #{id}" });
            return Ok(category);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromHeader(Name = "X-User-Role")] string role, [FromBody] CategoryRequest request, CancellationToken cancellationToken)
        {
            if (role != "Admin") return Unauthorized(new { message = "Chỉ Admin mới có quyền tạo danh mục" });
            if (string.IsNullOrWhiteSpace(request.CategoryName)) return BadRequest(new { message = "CategoryName không được để trống" });

            var category = new Category { CategoryName = request.CategoryName };
            await _unitOfWork.Categories.AddAsync(category, cancellationToken);
            await _unitOfWork.CompleteAsync(cancellationToken);

            return Created($"/api/categories/{category.Id}", category);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromHeader(Name = "X-User-Role")] string role, [FromBody] CategoryRequest request, CancellationToken cancellationToken)
        {
            if (role != "Admin") return Unauthorized();

            var category = await _unitOfWork.Categories.GetByIdAsync(id, cancellationToken);
            if (category == null) return NotFound(new { message = "Không tìm thấy danh mục" });

            if (!string.IsNullOrWhiteSpace(request.CategoryName))
            {
                category.CategoryName = request.CategoryName;
            }

            _unitOfWork.Categories.Update(category);
            await _unitOfWork.CompleteAsync(cancellationToken);

            return Ok(category);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, [FromHeader(Name = "X-User-Role")] string role, CancellationToken cancellationToken)
        {
            if (role != "Admin") return Unauthorized();

            var category = await _unitOfWork.Categories.GetByIdAsync(id, cancellationToken);
            if (category == null) return NotFound(new { message = "Không tìm thấy danh mục" });

            _unitOfWork.Categories.Delete(category);
            await _unitOfWork.CompleteAsync(cancellationToken);

            return Ok(new { message = "Xóa danh mục thành công" });
        }
    }

    public class CategoryRequest
    {
        public string CategoryName { get; set; } = string.Empty;
    }
}
