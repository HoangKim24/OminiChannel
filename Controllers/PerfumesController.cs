using Microsoft.AspNetCore.Mvc;
using Omnichannel.Infrastructure;
using Omnichannel.Models;
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
            if (perfume == null) return NotFound();
            return Ok(perfume);
        }

        [HttpPost]
        public async Task<ActionResult<Perfume>> CreatePerfume([FromHeader(Name = "X-User-Role")] string role, [FromBody] Perfume perfume)
        {
            var proxy = new Services.SecurityProxy(new Services.AdminService(_unitOfWork), role);
            await proxy.CreateProductAsync(perfume);
            return CreatedAtAction(nameof(GetPerfume), new { id = perfume.Id }, perfume);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePerfume(int id, [FromHeader(Name = "X-User-Role")] string role, [FromBody] Perfume perfume)
        {
            if (id != perfume.Id) return BadRequest();
            var proxy = new Services.SecurityProxy(new Services.AdminService(_unitOfWork), role);
            await proxy.UpdateProductAsync(perfume);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePerfume(int id, [FromHeader(Name = "X-User-Role")] string role)
        {
            var proxy = new Services.SecurityProxy(new Services.AdminService(_unitOfWork), role);
            var success = await proxy.DeleteProductAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
