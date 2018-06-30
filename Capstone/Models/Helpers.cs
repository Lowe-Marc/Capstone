using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Hosting;
using System.IO;
using System.Web.Script.Serialization;

namespace Capstone.Models
{
    public class Helpers
    {   
        public static Dictionary<String, List<String>> readConfigFiles(string configDirName)
        {
            string simulationDir = HostingEnvironment.ApplicationPhysicalPath + "SimulationConfig\\" + configDirName;
            string[] directories = Directory.GetFiles(simulationDir);
            Dictionary<String, List<String>> simulations = new Dictionary<String, List<String>>();
            List<String> lines;
            String line;
            foreach (string fileName in directories) {
                lines = new List<String>();
                using (var reader = new StreamReader(fileName))
                {
                    while((line = reader.ReadLine()) != null)
                    {
                        lines.Add(line);
                    }
                }
                simulations.Add(fileName, lines);
            }
            return simulations;
        }
    }
}