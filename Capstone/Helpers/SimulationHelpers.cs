using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using C5;

namespace Capstone.Models
{
    public class Animation
    {
        public List<AnimationFrame> frames;
        public List<List<AStarAnimationNode>> simulationSpecific;
    }

    public class AnimationFrame
    {
        public List<AStarAnimationNode> frame;

        public AnimationFrame()
        {
            frame = new List<AStarAnimationNode>();
        }
    }

    public class AStarAnimationNode
    {
        public int id;
        public string name;

        public AStarAnimationNode(int thisID)
        {
            id = thisID;
        }
    }

    public class AStarNode
    {
        public string id;
        public double x;
        public double y;
        public List<AStarAnimationNode> path;
    }

    public class AStarEdge
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
        
        public CytoscapeNode getStart()
        {
            foreach (CytoscapeNode node in nodes)
            {
                if (node.id == startID)
                    return node;
            }
            return null;
        }

        public CytoscapeNode getGoal()
        {
            foreach (CytoscapeNode node in nodes)
            {
                if (node.id == goalID)
                    return node;
            }
            return null;
        }
    }

    public class CytoscapeConnection
    {
        public int source { get; set; }
        public int target { get; set; }
        public double heuristic { get; set; }
        public double distance { get; set; }
    }

    public class CytoscapeNode : IComparable
    {
        public int id { get; set; }
        public string name { get; set; }
        public List<CytoscapeConnection> connections { get; set; }

        // Below will not be set in UI
        public double heuristic { get; set; }
        public double distance { get; set; }
        public List<CytoscapeNode> path { get; set; }

        public CytoscapeNode()
        {
            path = new List<CytoscapeNode>();
            path.Add(this);
        }

        // Will throw an exception if compared to any other type
        public int CompareTo(Object node)
        {
            return heuristic.CompareTo(((CytoscapeNode)node).heuristic);
        }

        public CytoscapeNode previous()
        {
            if (path == null)
            {
                path = new List<CytoscapeNode>();
                path.Add(this);
            }
            return path.First();
        }
    }

    public class SimulationHelpers
    {
    }
}