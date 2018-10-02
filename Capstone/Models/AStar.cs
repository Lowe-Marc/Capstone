using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using C5;

namespace Capstone.Models
{
    public class AStar
    {
        /*
         * Currently using two different classes to perform simulations. One is prefaced with
         * Cytoscape, which is passed in via the UI's ajax call. The other is prefaced with
         * Animation, which is a simplified form and is passed back to the UI to animate.
         * May not be worth the extra processing time depending on how the configurations scale.
         */
        public static Animation runSimulation(int startID, int goalID, CytoscapeParams cyParams)
        {
            //return testAnim(startID, goalID);
            Animation results = new Animation();
            List<IntervalHeap<CytoscapeNode>> frontierOvertime = new List<IntervalHeap<CytoscapeNode>>();
            List<AnimationFrame> frames = new List<AnimationFrame>();
            bool goalFound = false;
            Dictionary<int, CytoscapeNode> map = initializeInternalNodes(cyParams.nodes);
            IntervalHeap<CytoscapeNode> frontier = new IntervalHeap<CytoscapeNode>();

            CytoscapeNode current = map[startID];
            while (!goalFound)
            {
                //Add new frontier to priority queue
                addToFrontier(map, frontier, current);

                //Store path every iteration for animation
                trackAnimationFrame(frames, current);

                //Store the frontier every iteration for animation
                frontierOvertime.Add(frontier);

                //Get the next node to expand
                current = frontier.DeleteMax();

                //When done we record the last frame's information and break
                if (current.id == goalID)
                {
                    goalFound = true;
                    trackAnimationFrame(frames, current);
                    frontierOvertime.Add(frontier);
                }
            }

            results.frames = frames;

            return results;
        }

        private static void addToFrontier(Dictionary<int, CytoscapeNode> map, IntervalHeap<CytoscapeNode> frontier, CytoscapeNode node)
        {
            CytoscapeNode tempNode;
            foreach (CytoscapeConnection connection in node.connections)
            {
                tempNode = map[connection.target];
                // Discard cyclic paths
                if (connection.target != node.previous().id)
                {
                    // Keep track of the path taken
                    if (node.path == null || !node.path.Any())
                    {
                        node.path = new List<CytoscapeNode>();
                        node.path.Add(node);
                    }
                    tempNode.path = node.path;
                    tempNode.path.Add(tempNode);
                    // Add on heuristic value
                    tempNode.distance = node.distance + connection.heuristic;
                    frontier.Add(tempNode);
                }
            }
        }

        // Produces a map to use for convenient lookup when adding to the frontier
        private static Dictionary<int, CytoscapeNode> initializeInternalNodes(List<CytoscapeNode> nodes)
        {
            Dictionary<int, CytoscapeNode> map = new Dictionary<int, CytoscapeNode>();
            foreach (CytoscapeNode node in nodes)
            {
                map.Add(node.id, node);
            }

            return map;
        }

        // Helper to keep track of the path being looked at every iteration
        private static void trackAnimationFrame(List<AnimationFrame> frames, CytoscapeNode current)
        {
            AnimationFrame frame = new AnimationFrame();
            frame.frame = new List<AStarAnimationNode>();
            AStarAnimationNode tempNode;

            foreach (CytoscapeNode node in current.path)
            {
                tempNode = new AStarAnimationNode();
                tempNode.id = node.id;
                frame.frame.Add(tempNode);
            }
            frames.Add(frame);
        }


        // For debug purposes
        private static Animation testAnim(int startID, int goalID)
        {
            Animation results = new Animation();
            results.frames = new List<AnimationFrame>();

            AnimationFrame firstFrame = new AnimationFrame();
            List<AStarAnimationNode> firstFrameContents = new List<AStarAnimationNode>();
            AStarAnimationNode start = new AStarAnimationNode();
            start.id = startID;
            firstFrameContents.Add(start);
            firstFrame.frame = firstFrameContents;
            results.frames.Add(firstFrame);

            AnimationFrame nextFrame = new AnimationFrame();
            List<AStarAnimationNode> nextFrameContents = new List<AStarAnimationNode>();
            AStarAnimationNode goal = new AStarAnimationNode();
            goal.id = goalID;
            nextFrameContents.Add(goal);
            nextFrame.frame = nextFrameContents;
            results.frames.Add(nextFrame);

            return results;
        }
    }

}