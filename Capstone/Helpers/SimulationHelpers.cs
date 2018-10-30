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

    public class SimulationSpecificAnimation
    {

    }

    public class AStarSpecificAnimation : SimulationSpecificAnimation
    {
        List<List<AStarAnimationNode>> priorityQueue;
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
        public double f;

        public AStarAnimationNode(int thisID)
        {
            id = thisID;
            f = 0;
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
        public double distance { get; set; }

        // Cytoscape required a source and target to be defined when rendering the network on the UI.
        // However, AStar will treat them as undirected connections, so this will make sure
        // We aren't accidentally looking at the wrong node.
        public int undirectedTarget(CytoscapeNode desiredSource)
        {
            if (source == desiredSource.id)
                return target;
            else
                return source;
        }
    }

    public class CytoscapeNode : IComparable
    {
        public int id { get; set; }
        public string name { get; set; }
        public double heuristic { get; set; }
        public List<CytoscapeConnection> connections { get; set; }

        // Below will not be set in UI
        public double distance { get; set; }
        public List<CytoscapeNode> path { get; set; }
        public double f { get; set; }

        public CytoscapeNode()
        {
            path = new List<CytoscapeNode>();
            path.Add(this);
        }
        
        public CytoscapeNode(CytoscapeNode copy)
        {
            this.id = copy.id;
            this.name = copy.name;
            this.heuristic = copy.heuristic;
            this.connections = copy.connections;
            this.path = copy.path;
        }

        // A CytoscapeNode is "greater than" another node if its distance + heuristic is
        // less than the node is it being compared to. This is written with the sole intention
        // of them being compared in the context of an AStar priority queue.
        // NOTE: Will throw an exception if compared to any other type
        public int CompareTo(Object node)
        {
            return -1 * (f).CompareTo(((CytoscapeNode)node).f);
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

        public bool hasVisitedNode(int id)
        {
            foreach (CytoscapeNode node in this.path)
            {
                if (node.id == id)
                {
                    return true;
                }
            }
            return false;
        }
    }

    public class CytoscapeMap
    {
        Dictionary<int, CytoscapeNode> contents;

        public CytoscapeMap(Dictionary<int, CytoscapeNode> map)
        {
            this.contents = map;
        }

        public CytoscapeNode getNode(int id)
        {
            return new CytoscapeNode(contents[id]);
        }
    }

    public class SimulationHelpers
    {
    }
}