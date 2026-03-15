using Microsoft.AspNetCore.Mvc;

namespace Omnichannel.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class SettingsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
