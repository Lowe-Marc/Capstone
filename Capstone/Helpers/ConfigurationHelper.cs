using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Hosting;
using System.IO;
using System.Web.Script.Serialization;

namespace Capstone.Models
{
    public class ConfigurationHelper
    {
        public const string A_STAR = "AStar";
        public const string DYNAMIC_PROGRAMMING = "Dynamic Programming";
        public const string REINFORCEMENT_LEARNING = "Reinforcement Learning";

        private static readonly string CONFIG_DIR = HostingEnvironment.ApplicationPhysicalPath + "SimulationConfig\\";

        /* 
        Map the simulation name(e.g.AStar, Dynamic Programming) to a list of configurations.
        Each configuration is a list of nodes and edges with their simulation specific information.
        */
        public static Dictionary<String, List<CytoscapeConfig>> CONFIGURATIONS;

        public struct CytoscapeConfig
        {
            public string name;
            public List<Object> nodes;
            public List<Object> edges;
        };

        public static string readConfigFiles(string simulationName)
        {
            if (CONFIGURATIONS == null)
                CONFIGURATIONS = new Dictionary<string, List<CytoscapeConfig>>();

            try
            {
                switch (simulationName)
                {
                    case A_STAR:
                        readAStarConfigs();
                        break;
                    case DYNAMIC_PROGRAMMING:
                        readDynamicProgrammingConfigs();
                        break;
                    case REINFORCEMENT_LEARNING:
                        readReinforcementLearningConfigs();
                        break;
                }
            }
            catch (Exception e)
            {
                return e.ToString();
            }

            return "";
        }

        private static void readAStarConfigs()
        {
            CONFIGURATIONS.Remove(A_STAR);
            List<CytoscapeConfig> AStarConfigs = new List<CytoscapeConfig>();

            string[] configFiles = Directory.GetFiles(CONFIG_DIR + A_STAR);
            
            foreach (string fileName in configFiles)
            {
                string line, name, edgeDistance;
                string[] lineContents;
                bool haveCities = false, haveFirstCity, haveSecondCity;
                char c;
                char[] lineCharArr;
                try
                {
                    List<Object> nodes = new List<Object>();
                    List<Object> edges = new List<Object>();
                    using (var reader = new StreamReader(fileName))
                    {
                        while ((line = reader.ReadLine()) != null)
                        {
                            if (line.Equals("# name latitude longitude"))
                                continue;
                            else if (line.Equals("# distances"))
                            {
                                haveCities = true;
                                continue;
                            }

                            AStarNode node = new AStarNode();
                            AStarEdge edge = new AStarEdge();
                            if (!haveCities)
                            {
                                //The cities will come in the form: name latitude longitude
                                //e.g. La Crosse 43.8 -91.24
                                name = "";
                                lineContents = line.Split(' ');
                                for (int i = 0; i < lineContents.Length - 2; i++)
                                {
                                    if (i > 0)
                                        name = name + " ";
                                    name = name + lineContents[i];
                                }
                                node.id = name;
                                node.x = Convert.ToDouble(lineContents[lineContents.Length - 2]);
                                node.y = Convert.ToDouble(lineContents[lineContents.Length - 1]);
                                node.coords = new Tuple<double, double>(node.x, node.y);
                                nodes.Add(node);
                            }
                            else
                            {
                                edge.source = "";
                                edge.target = "";
                                //The distances will come in the form: a, b: distance
                                //e.g. La Crosse, La Crescent: 5.0
                                haveFirstCity = false;
                                haveSecondCity = false;
                                edgeDistance = "";
                                lineCharArr = line.ToCharArray();
                                //Walk through each character, collecting the information
                                for (int i = 0; i < lineCharArr.Length; i++)
                                {
                                    c = lineCharArr[i];
                                    if (c == ',')
                                    {
                                        haveFirstCity = true;
                                        continue;
                                    }
                                    else if (c == ':')
                                    {
                                        haveSecondCity = true;
                                        continue;
                                    }

                                    if (!haveFirstCity)
                                    {
                                        edge.source = edge.source + c;
                                    }
                                    else if (haveFirstCity && !haveSecondCity)
                                    {
                                        edge.target = edge.target + c;
                                    }
                                    else if (haveFirstCity && haveSecondCity)
                                    {
                                        if (c != ' ')
                                            edgeDistance = edgeDistance + c;
                                    }
                                }
                                try
                                {
                                    edge.distance = Convert.ToDouble(edgeDistance);
                                    edge.source = edge.source.Trim();
                                    edge.target = edge.target.Trim();
                                }
                                catch (Exception e)
                                {
                                    throw new Exception(line + ", " + haveFirstCity + ", " + haveSecondCity + ", " + haveCities);
                                }
                                
                                edges.Add(edge);
                            }
                        }
                    }
                    CytoscapeConfig thisConfig = new CytoscapeConfig();
                    thisConfig.name = fileName.Split('\\').Last().Split('.').First();
                    thisConfig.nodes = nodes;
                    thisConfig.edges = edges;
                    AStarConfigs.Add(thisConfig);
                }
                catch (Exception e)
                {
                    string description = e.ToString();
                    description = "Exception thrown while parsing: " + fileName + "\n" + description;
                    throw new Exception(description);
                }
            }

            CONFIGURATIONS[A_STAR] = AStarConfigs;
        }

        // The first line of DP config files is the number of columns and rows
        // Then the maze itself
        private static void readDynamicProgrammingConfigs()
        {
            CONFIGURATIONS.Remove(DYNAMIC_PROGRAMMING);
            List<CytoscapeConfig> DPConfigs = new List<CytoscapeConfig>();

            string[] configFiles = Directory.GetFiles(CONFIG_DIR + DYNAMIC_PROGRAMMING);

            foreach (string fileName in configFiles)
            {
                string line;
                bool haveDimensions = false, haveStart = false, haveGoal = false;
                string[] lineContents;
                int numRows = 0, numColumns = 0, currentRow, startX = 0, startY = 0, goalX = 0, goalY = 0;
                Tuple<int, int> dimensions, startCoord, goalCoord;
                try
                {
                    List<Object> nodes = new List<Object>();
                    List<Object> edges = new List<Object>();
                    using (var reader = new StreamReader(fileName))
                    {
                        currentRow = 0;
                        while ((line = reader.ReadLine()) != null)
                        {
                            lineContents = line.Split(' ');
                            if (!haveDimensions)
                            {
                                numRows = Convert.ToInt32(lineContents[0]);
                                numColumns = Convert.ToInt32(lineContents[1]);
                                dimensions = new Tuple<int, int>(numRows, numColumns);
                                haveDimensions = true;
                            }
                            else if (!haveStart)
                            {
                                startX = Convert.ToInt32(lineContents[0]);
                                startY = Convert.ToInt32(lineContents[1]);
                                startCoord = new Tuple<int, int>(startX, startY);
                                haveStart = true;
                            }
                            else if (!haveGoal)
                            {
                                goalX = Convert.ToInt32(lineContents[0]);
                                goalY = Convert.ToInt32(lineContents[1]);
                                goalCoord = new Tuple<int, int>(goalX, goalY);
                                haveGoal = true;
                            }
                            else
                            {
                                for (int i = 0; i < lineContents.Length; i++)
                                {
                                    DPNode node = new DPNode();
                                    node.cellType = (DPCellType)Convert.ToInt32(lineContents[i]);
                                    if (currentRow == goalY && i == goalX)
                                    {
                                        node.goal = true;
                                    }
                                    if (currentRow == startY && i == startX)
                                    {
                                        node.start = true;
                                    }
                                    node.coords = new Tuple<int, int>(i, currentRow);

                                    // Connect every node to the nodes around it, account for boundaries
                                    // Since edges are undirected, only need to make 2 per node
                                    if (currentRow < numRows - 1)
                                    {
                                        DPEdge bottomEdge = new DPEdge();
                                        bottomEdge.source = new Tuple<int, int>(i, currentRow);
                                        bottomEdge.target = new Tuple<int, int>(i, currentRow + 1);
                                        edges.Add(bottomEdge);
                                    }
                                    if (i < lineContents.Length - 1)
                                    {
                                        DPEdge rightEdge = new DPEdge();
                                        rightEdge.source = new Tuple<int, int>(i, currentRow);
                                        rightEdge.target = new Tuple<int, int>(i + 1, currentRow);
                                        edges.Add(rightEdge);
                                    }
                                    nodes.Add(node);
                                }
                                currentRow += 1;
                            }
                        }
                    }
                    CytoscapeConfig thisConfig = new CytoscapeConfig();
                    thisConfig.name = fileName.Split('\\').Last().Split('.').First();
                    thisConfig.nodes = nodes;
                    thisConfig.edges = edges;
                    DPConfigs.Add(thisConfig);
                }
                catch (Exception e)
                {
                    string description = e.ToString();
                    description = "Exception thrown while parsing: " + fileName + "\n" + description;
                    throw new Exception(description);
                }
            }

            CONFIGURATIONS[DYNAMIC_PROGRAMMING] = DPConfigs;
        }

        // At least for the time being, the DP and RL configuration files have be the same structure
        private static void readReinforcementLearningConfigs()
        {
            CONFIGURATIONS.Remove(REINFORCEMENT_LEARNING);
            List<CytoscapeConfig> RLConfigs = new List<CytoscapeConfig>();

            string[] configFiles = Directory.GetFiles(CONFIG_DIR + REINFORCEMENT_LEARNING);

            foreach (string fileName in configFiles)
            {
                string line;
                bool haveDimensions = false, haveStart = false, haveGoal = false;
                string[] lineContents;
                int numRows = 0, numColumns = 0, currentRow, startX = 0, startY = 0, goalX = 0, goalY = 0;
                Tuple<int, int> dimensions, startCoord, goalCoord;
                try
                {
                    List<Object> nodes = new List<Object>();
                    List<Object> edges = new List<Object>();
                    using (var reader = new StreamReader(fileName))
                    {
                        currentRow = 0;
                        while ((line = reader.ReadLine()) != null)
                        {
                            lineContents = line.Split(' ');
                            if (!haveDimensions)
                            {
                                numRows = Convert.ToInt32(lineContents[0]);
                                numColumns = Convert.ToInt32(lineContents[1]);
                                dimensions = new Tuple<int, int>(numRows, numColumns);
                                haveDimensions = true;
                            }
                            else if (!haveStart)
                            {
                                startX = Convert.ToInt32(lineContents[0]);
                                startY = Convert.ToInt32(lineContents[1]);
                                startCoord = new Tuple<int, int>(startX, startY);
                                haveStart = true;
                            }
                            else if (!haveGoal)
                            {
                                goalX = Convert.ToInt32(lineContents[0]);
                                goalY = Convert.ToInt32(lineContents[1]);
                                goalCoord = new Tuple<int, int>(goalX, goalY);
                                haveGoal = true;
                            }
                            else
                            {
                                for (int i = 0; i < lineContents.Length; i++)
                                {
                                    DPNode node = new DPNode();
                                    node.cellType = (DPCellType)Convert.ToInt32(lineContents[i]);
                                    if (currentRow == goalY && i == goalX)
                                    {
                                        node.goal = true;
                                    }
                                    if (currentRow == startY && i == startX)
                                    {
                                        node.start = true;
                                    }
                                    node.coords = new Tuple<int, int>(i, currentRow);

                                    // Connect every node to the nodes around it, account for boundaries
                                    // Since edges are undirected, only need to make 2 per node
                                    if (currentRow < numRows - 1)
                                    {
                                        DPEdge bottomEdge = new DPEdge();
                                        bottomEdge.source = new Tuple<int, int>(i, currentRow);
                                        bottomEdge.target = new Tuple<int, int>(i, currentRow + 1);
                                        edges.Add(bottomEdge);
                                    }
                                    if (i < lineContents.Length - 1)
                                    {
                                        DPEdge rightEdge = new DPEdge();
                                        rightEdge.source = new Tuple<int, int>(i, currentRow);
                                        rightEdge.target = new Tuple<int, int>(i + 1, currentRow);
                                        edges.Add(rightEdge);
                                    }
                                    nodes.Add(node);
                                }
                                currentRow += 1;
                            }
                        }
                    }
                    CytoscapeConfig thisConfig = new CytoscapeConfig();
                    thisConfig.name = fileName.Split('\\').Last().Split('.').First();
                    thisConfig.nodes = nodes;
                    thisConfig.edges = edges;
                    RLConfigs.Add(thisConfig);
                }
                catch (Exception e)
                {
                    string description = e.ToString();
                    description = "Exception thrown while parsing: " + fileName + "\n" + description;
                    throw new Exception(description);
                }
            }

            CONFIGURATIONS[REINFORCEMENT_LEARNING] = RLConfigs;
        }
    }
}