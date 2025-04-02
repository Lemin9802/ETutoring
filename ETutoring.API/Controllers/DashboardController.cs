using ETutoring.Business.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ETutoring.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpPost]
        public async Task<IActionResult> GetDashboardData()
        {
            var dashboardData = await _dashboardService.GetDashboardDataAsync();
            return Ok(dashboardData);
        }
    }
}
