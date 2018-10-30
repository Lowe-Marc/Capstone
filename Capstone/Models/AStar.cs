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
         * Cytoscape, which is passed in via the UI's ajax call and used in the simulation.
         * The other is prefaced with Animation, which is a simplified form and is
         * passed back to the UI to animate. In addition to it being a simplified form, it 
         * also does not contain any circular references, unlike the Cytoscape versions. 
         * C# has issues serializing objects with circular references, unlike Javascript.
         */
        public static Animation runSimulation(int startID, int goalID, CytoscapeParams cyParams)
        {
            //return testAnim(startID, goalID);
            Animation results = new Animation();
            List<List<AStarAnimationNode>> frontierOvertime = new List<List<AStarAnimationNode>>();
            List<AnimationFrame> frames = new List<AnimationFrame>();
            bool goalFound = false;
            CytoscapeMap map = new CytoscapeMap(initializeInternalNodes(cyParams.nodes));
            IntervalHeap<CytoscapeNode> frontier = new IntervalHeap<CytoscapeNode>();

            CytoscapeNode current = map.getNode(startID);
            while (!goalFound)
            {
                //Add new frontier to priority queue
                addToFrontier(map, frontier, current);

                //Store path every iteration for animation
                trackAnimationFrame(frames, current);

                //Store the frontier every iteration for animation
                storeFrontierOverTime(frontierOvertime, frontier);

                //Get the next node to expand
                current = frontier.DeleteMax();

                //When done we record the last frame's information and break
                if (current.id == goalID)
                {
                    goalFound = true;
                    trackAnimationFrame(frames, current);
                    storeFrontierOverTime(frontierOvertime, frontier);
                }
            }

            results.frames = frames;
            results.simulationSpecific = frontierOvertime;

            return results;
        }

        private static void addToFrontier(CytoscapeMap map, IntervalHeap<CytoscapeNode> frontier, CytoscapeNode node)
        {
            CytoscapeNode tempNode;
            foreach (CytoscapeConnection connection in node.connections)
            {
                int undirectedTargetID = connection.undirectedTarget(node);
                tempNode = map.getNode(undirectedTargetID);
                // Discard cyclic paths
                if (!node.hasVisitedNode(undirectedTargetID))
                {
                    // Keep track of the path taken
                    if (node.path == null || !node.path.Any())
                    {
                        node.path = new List<CytoscapeNode>();
                        node.path.Add(node);
                    }
                    // Make sure to be duplicating the path instead of pointing at node's path field
                    tempNode.path = new List<CytoscapeNode>(node.path);
                    tempNode.path.Add(tempNode);
                    // f is the heuristic plus the distance traveled so far
                    tempNode.distance = node.distance + connection.distance;
                    tempNode.f = tempNode.heuristic + tempNode.distance;
                    frontier.Add(tempNode);
                }
            }
        }

        // Converts the Cytoscape nodes into animation nodes and pushes them onto the list that tracks frontiers
        // We have to clone the frontier and then delete the elements from the copy because there is no way
        // to iterate through the frontier ordered by priority.
        private static void storeFrontierOverTime(List<List<AStarAnimationNode>> frontierOverTime, IntervalHeap<CytoscapeNode> frontier)
        {
            IntervalHeap<CytoscapeNode> frontierCopy = cloneFrontier(frontier);
            AStarAnimationNode animationNode;
            List<AStarAnimationNode> currentFrontier = new List<AStarAnimationNode>();
            CytoscapeNode cyNode;
            while (frontierCopy.Any())
            {
                cyNode = frontierCopy.DeleteMax();
                animationNode = new AStarAnimationNode(cyNode.id);
                animationNode.name = cyNode.name;
                animationNode.f = cyNode.f;
                currentFrontier.Add(animationNode);
            }

            frontierOverTime.Add(currentFrontier);
        }

        // Helper method to duplicate an interval heap
        private static IntervalHeap<CytoscapeNode> cloneFrontier(IntervalHeap<CytoscapeNode> frontier)
        {
            IntervalHeap<CytoscapeNode> frontierCopy = new IntervalHeap<CytoscapeNode>();
            foreach (CytoscapeNode cyNode in frontier)
                frontierCopy.Add(cyNode);
            return frontierCopy;
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
                tempNode = new AStarAnimationNode(node.id);
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
            AStarAnimationNode start = new AStarAnimationNode(startID);
            firstFrameContents.Add(start);
            firstFrame.frame = firstFrameContents;
            results.frames.Add(firstFrame);

            AnimationFrame nextFrame = new AnimationFrame();
            List<AStarAnimationNode> nextFrameContents = new List<AStarAnimationNode>();
            AStarAnimationNode goal = new AStarAnimationNode(goalID);
            nextFrameContents.Add(goal);
            nextFrame.frame = nextFrameContents;
            results.frames.Add(nextFrame);

            return results;
        }
    }

}