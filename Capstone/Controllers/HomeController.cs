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
            IntPtr testCppObj = Capstone.Models.TestModel.CreateTest();
            int testInt = Capstone.Models.TestModel.TestFunction(testCppObj);
            //Capstone.Models.TestModel.DeleteTest(testCppObj);
            //testCppObj = IntPtr.Zero;
            ViewData["TestInt"] = testInt;

            return View();
        }

        public ActionResult AStar()
        {
            ViewData["ConfigurationException"] = ConfigurationHelper.readConfigFiles(ConfigurationHelper.A_STAR);
            ViewData["ConfigurationException"] = "Test";

            List <ConfigurationHelper.CytoscapeConfig> AStarConfigs = new List<ConfigurationHelper.CytoscapeConfig>();
            if (ConfigurationHelper.CONFIGURATIONS != null && ConfigurationHelper.CONFIGURATIONS.ContainsKey("AStar"))
                AStarConfigs = ConfigurationHelper.CONFIGURATIONS["AStar"];

            ViewData["Configs"] = AStarConfigs;

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