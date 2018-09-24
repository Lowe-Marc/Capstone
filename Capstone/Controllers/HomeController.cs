using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using Capstone.Models;

using System.Runtime.InteropServices;

namespace Capstone.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            // Create CPP obj
            IntPtr testCppObj = TestModel.CreateTest();
            // Run simulaiton
            TestModel.TestRunSim(testCppObj);
            // Get the frame count
            int numFrames = 0;
            TestModel.TestGetFrameCount(testCppObj, numFrames);
            // Allocate frame size buffer and collect frame sizes;
            int[] sizes = new int[numFrames];
            TestModel.TestGetFrameSizes(testCppObj, sizes);
            //Marshal.Copy(TestModel.TestGetFrameSizes(testCppObj), sizes, 0, numFrames);
            // Allocate frame buffer and collect frames
            int[][] frames = new int[numFrames][];
            //TestModel.TestAnimationStruct testStruct = new TestModel.TestAnimationStruct
            //{
            //    frames = new int[numFrames][]
            //};
            bool success = TestModel.TestGetResults(testCppObj, frames);
            ViewData["Success"] = success;
            ViewData["NumFrames"] = numFrames;
            ViewData["Sizes"] = sizes;
            ViewData["Frames"] = frames;

            return View();
        }

        public ActionResult AStar()
        {
            ViewData["ConfigurationException"] = ConfigurationHelper.readConfigFiles(ConfigurationHelper.A_STAR);

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

        public ActionResult Debug()
        {
            ViewData["AStarConfigurationException"] = ConfigurationHelper.readConfigFiles(ConfigurationHelper.A_STAR).ToString().Replace("\n", "<br />").Replace("System.Exception:", "");

            return View();
        }
    }
}