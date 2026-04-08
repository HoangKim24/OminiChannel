using Omnichannel.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Omnichannel.Services
{
    public interface IAdminService
    {
        Task<bool> CreateProductAsync(Perfume perfume);
        Task<bool> UpdateProductAsync(Perfume perfume);
        Task<bool> DeleteProductAsync(int id);
    }

    public class AdminService : IAdminService
    {
        private readonly Infrastructure.IUnitOfWork _uow;

        public AdminService(Infrastructure.IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<bool> CreateProductAsync(Perfume perfume)
        {
            await _uow.Perfumes.AddAsync(perfume);
            await _uow.CompleteAsync();
            return true;
        }

        public async Task<bool> UpdateProductAsync(Perfume perfume)
        {
            _uow.Perfumes.Update(perfume);
            await _uow.CompleteAsync();
            return true;
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            var p = await _uow.Perfumes.GetByIdAsync(id);
            if (p == null) return false;
            _uow.Perfumes.Delete(p);
            await _uow.CompleteAsync();
            return true;
        }
    }

    // Proxy Pattern
    public class SecurityProxy : IAdminService
    {
        private readonly IAdminService _realService;
        private readonly ClaimsPrincipal _principal;

        public SecurityProxy(IAdminService realService, ClaimsPrincipal principal)
        {
            _realService = realService;
            _principal = principal;
        }

        private void EnsureAdmin()
        {
            var isAdmin = _principal.Claims
                .Where(c => c.Type == ClaimTypes.Role)
                .Any(c => string.Equals(c.Value, "Admin", StringComparison.OrdinalIgnoreCase));

            if (!isAdmin)
            {
                throw new UnauthorizedAccessException("Chỉ Admin mới có quyền thực hiện.");
            }
        }

        public Task<bool> CreateProductAsync(Perfume perfume)
        {
            EnsureAdmin();
            return _realService.CreateProductAsync(perfume);
        }

        public Task<bool> UpdateProductAsync(Perfume perfume)
        {
            EnsureAdmin();
            return _realService.UpdateProductAsync(perfume);
        }

        public Task<bool> DeleteProductAsync(int id)
        {
            EnsureAdmin();
            return _realService.DeleteProductAsync(id);
        }
    }
}
