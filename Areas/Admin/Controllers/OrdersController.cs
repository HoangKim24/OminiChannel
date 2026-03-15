using Microsoft.AspNetCore.Mvc;

namespace Omnichannel.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class OrdersController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
