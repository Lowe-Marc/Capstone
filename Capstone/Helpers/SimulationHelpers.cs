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

    public class SimulationHelpers
    {
    }
}