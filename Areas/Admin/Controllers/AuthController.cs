using Microsoft.AspNetCore.Mvc;

namespace Omnichannel.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class AuthController : Controller
    {
        public IActionResult Login()
        {
            return View();
        }
    }
}
