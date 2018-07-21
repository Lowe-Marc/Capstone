using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;


namespace Capstone.Controllers
{
    public class ConfigurationsController : Controller
    {
        // GET: Configurations
        public ActionResult Sync()
        {
            try
            {
                Models.ConfigurationHelper.readConfigFiles();
            }
            catch (Exception e)
            {
                ViewData["Exception"] = e.ToString();
            }
            
            return View();
        }
    }
}