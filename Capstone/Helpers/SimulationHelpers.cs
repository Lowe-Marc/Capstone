using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Capstone.Models
{
    public struct Animation
    {
        public List<AnimationFrame> frames;
    }

    public struct AnimationFrame
    {
        public List<AStarAnimationNode> frame;
    }

    public struct AStarAnimationNode
    {
        public int id;
    }

    public struct AStarNode
    {
        public string id;
        public double x;
        public double y;
    }

    public struct AStarEdge
    {
        public string source;
        public string target;
        public double distance;
        public double heuristicValue;
    }


    // Params coming from the view, built in javascript
    public class CytoscapeParams
    {
        public int startID { get; set; }
        public int goalID { get; set; }
        public List<CytoscapeNode> nodes { get; set; }
    }

    public class CytoscapeConnection
    {
        string source { get; set; }
        string target { get; set; }
        double heuristic { get; set; }
        double distance { get; set; }
    }

    public class CytoscapeNode
    {
        int id { get; set; }
        List<CytoscapeConnection> connections { get; set; }
    }

    public class SimulationHelpers
    {
    }
}