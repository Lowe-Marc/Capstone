using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using Capstone.Models;

using System.Runtime.InteropServices;
using System.Drawing;
using System.IO;

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
            ViewData["ConfigurationException"] = ConfigurationHelper.readConfigFiles(ConfigurationHelper.A_STAR);

            List <ConfigurationHelper.CytoscapeConfig> AStarConfigs = new List<ConfigurationHelper.CytoscapeConfig>();
            if (ConfigurationHelper.CONFIGURATIONS != null && ConfigurationHelper.CONFIGURATIONS.ContainsKey(ConfigurationHelper.A_STAR))
                AStarConfigs = ConfigurationHelper.CONFIGURATIONS[ConfigurationHelper.A_STAR];

            ViewData["Configs"] = AStarConfigs;

            return View();
        }

        public ActionResult DynamicProgramming()
        {
            ViewData["ConfigurationException"] = ConfigurationHelper.readConfigFiles(ConfigurationHelper.DYNAMIC_PROGRAMMING);

            List<ConfigurationHelper.CytoscapeConfig> DPConfigs = new List<ConfigurationHelper.CytoscapeConfig>();
            if (ConfigurationHelper.CONFIGURATIONS != null && ConfigurationHelper.CONFIGURATIONS.ContainsKey(ConfigurationHelper.DYNAMIC_PROGRAMMING))
                DPConfigs = ConfigurationHelper.CONFIGURATIONS[ConfigurationHelper.DYNAMIC_PROGRAMMING];

            ViewData["Configs"] = DPConfigs;
            ViewData["Images"] = getDPImages();

            return View();
        }

        public ActionResult ReinforcementLearning()
        {
            ViewData["ConfigurationException"] = ConfigurationHelper.readConfigFiles(ConfigurationHelper.REINFORCEMENT_LEARNING);

            List<ConfigurationHelper.CytoscapeConfig> DPConfigs = new List<ConfigurationHelper.CytoscapeConfig>();
            if (ConfigurationHelper.CONFIGURATIONS != null && ConfigurationHelper.CONFIGURATIONS.ContainsKey(ConfigurationHelper.REINFORCEMENT_LEARNING))
                DPConfigs = ConfigurationHelper.CONFIGURATIONS[ConfigurationHelper.REINFORCEMENT_LEARNING];

            ViewData["Configs"] = DPConfigs;
            ViewData["Images"] = getDPImages();

            return View();
        }

        public ActionResult Debug()
        {
            ViewData["AStarConfigurationException"] = ConfigurationHelper.readConfigFiles(ConfigurationHelper.A_STAR).ToString().Replace("\n", "<br />").Replace("System.Exception:", "");

            return View();
        }

        private List<String> getDPImages()
        {
            List<String> images = new List<String>();
            images.Add(ConvertImageToBase64String("~/vendor/open-iconic-master/png/arrow-left-2x.png"));
            images.Add(ConvertImageToBase64String("~/vendor/open-iconic-master/png/arrow-right-2x.png"));
            images.Add(ConvertImageToBase64String("~/vendor/open-iconic-master/png/arrow-top-2x.png"));
            images.Add(ConvertImageToBase64String("~/vendor/open-iconic-master/png/arrow-bottom-2x.png"));
            return images;
        }

        private string ConvertImageToBase64String(string imageUrl)
        {
            string imagepath = System.Web.HttpContext.Current.Server.MapPath(imageUrl);

            using (Image image = Image.FromFile(imagepath))
            {
                using (MemoryStream memoryStream = new MemoryStream())
                {
                    // Convert Image to byte[]
                    image.Save(memoryStream, image.RawFormat);
                    byte[] imageBytes = memoryStream.ToArray();

                    // Convert byte[] to Base64 String
                    string base64String = Convert.ToBase64String(imageBytes);
                    return base64String;
                }
            }
        }
    }
}