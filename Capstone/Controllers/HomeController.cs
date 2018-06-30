using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using Capstone.Models;

namespace Capstone.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult AStar()
        {
            Dictionary<String, List<String>> configs = Helpers.readConfigFiles("AStar");
            ViewData["Configs"] = configs;
            return View();
        }

        public ActionResult DynamicProgramming()
        {
            return View();
        }

        public ActionResult ReinforcementLearning()
        {
            return View();
        }
    }
}