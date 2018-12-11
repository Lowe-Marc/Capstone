using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Capstone.Models
{
    public class DynamicProgramming
    {
        const int LEFT = 0;
        const int RIGHT = 1;
        const int TOP = 2;
        const int BOTTOM = 3;
        const int DIDNTMOVE = 4;
        const int WALL_VALUE = 100;

        private static double SLIPPING_PROB = 0.8;

        public static Animation runSimulation(CytoscapeParams cyParams)
        {
            //return sampleData(startID, goalID, cyParams);
            int startID = cyParams.startID;
            int goalID = cyParams.goalID;
            double theta = cyParams.theta;
            SLIPPING_PROB = cyParams.probOfSlipping;
            Animation results = new Animation();
            List<AnimationFrame> frames = new List<AnimationFrame>();
            List<int> currentPolicy, previousPolicy;
            List<double> currentIteration = new List<double>();
            List<double> deltaForIteration = new List<double>();
            List<List<double>> calculation;
            List<List<double>> deltaForCalculation;
            currentPolicy = initializePolicy(cyParams);

            DPSpecific simulationSpecific = new DPSpecific();

            // Maps the id of a location to the utility value associated with it
            Dictionary<int, double> utilityFunction = new Dictionary<int, double>();
            Dictionary<Tuple<int,int>, CytoscapeNode> nodeMap = new Dictionary<Tuple<int, int>, CytoscapeNode>();
            Dictionary<int, CytoscapeNode> nodeIDMap = new Dictionary<int, CytoscapeNode>();
            for (int i = 0; i < cyParams.nodes.Count; i++)
            {
                utilityFunction.Add(i, 0.0);
                Tuple<int, int> coords = new Tuple<int, int>(cyParams.nodes[i].x, cyParams.nodes[i].y);
                nodeMap.Add(coords, cyParams.nodes[i]);
                nodeIDMap.Add(i, cyParams.nodes[i]);
            }

            // Initialize delta
            // Initialize random policy
            double delta = 0.0;
            double gamma = 0.9;
            int timeHorizon = cyParams.nodes.Count;
            int iterationNumber = 0;

            double currentValue = 0.0;
            bool policyHasChanged = true;
            DPAnimationFrame frame;
            CytoscapeNode newState;
            int action;
            while (policyHasChanged && iterationNumber < timeHorizon)
            {
                frame = new DPAnimationFrame();
                delta = theta;
                // Perform a Bellman calculation
                calculation = new List<List<double>>();
                deltaForCalculation = new List<List<double>>();
                while (delta >= theta)
                {
                    currentIteration = new List<double>();
                    deltaForIteration = new List<double>();
                    delta = 0.0;
                    // Loop through every state (location in the maze)
                    for (int i = 0; i < cyParams.nodes.Count; i++)
                    {
                        // Walls default to the value WALL_VALUE
                        if (cyParams.nodes[i].cellType == DPCellType.Wall)
                        {
                            deltaForIteration.Add(delta);
                            currentIteration.Add(WALL_VALUE);
                            continue;
                        }
                        // Get the value of the current utility function for that state
                        currentValue = utilityFunction[i];
                        // Update the utility function for that state to be prob(oldState, policyAction, newState)*(reward(newState) + gamma*utility(newState))
                        action = currentPolicy[cyParams.nodes[i].id];
                        //newState = getNewState(nodeMap, action, cyParams.nodes[i]);


                        double newFunctionVal = 0.0;
                        for (int j = 0; j < 5; j++)
                        {
                            newState = getNewState(nodeMap, j, cyParams.nodes[i]);
                            newFunctionVal += probabilityOfTransition(cyParams.nodes[i], nodeMap, j, action) * (rewardForState(newState, goalID) + gamma * utilityFunction[newState.id]);
                        }
                        utilityFunction[i] = newFunctionVal;
                        //utilityFunction[i] = probabilityOfTransition(cyParams.nodes[i], nodeMap) * (rewardForState(newState, goalID) + gamma * utilityFunction[newState.id]);
                        if (Math.Abs(currentValue - utilityFunction[i]) > delta)
                            delta = Math.Abs(currentValue - utilityFunction[i]);

                        deltaForIteration.Add(delta);
                        currentIteration.Add(utilityFunction[i]);
                    }
                    // Store the values for this iteration
                    calculation.Add(currentIteration);
                    deltaForCalculation.Add(deltaForIteration);
                }
                // Store the values for this calculation
                frame.policy = new List<int>(currentPolicy);
                frame.values = calculation;
                frame.deltas = deltaForCalculation;

                // Update the policy
                previousPolicy = new List<int>(currentPolicy);
                currentPolicy = updatePolicy(currentPolicy, currentIteration, nodeMap, nodeIDMap);
                if (previousPolicy.SequenceEqual(currentPolicy))
                    policyHasChanged = false;
                frames.Add(frame);
                iterationNumber++;
            }

            simulationSpecific.gamma = gamma;
            simulationSpecific.theta = theta;

            results.simulationSpecific = simulationSpecific;
            results.frames = frames;

            return results;
        }

        // If the cell is slippery, there is a 80% chance of staying in the same cell
        // Otherwise, if there is a 100% chance of going in the direction of the policy
        private static double probabilityOfTransition(CytoscapeNode node, Dictionary<Tuple<int, int>, CytoscapeNode> nodeMap, int action, int actionAccordingToPolicy)
        {
            double probability = 1.0;

            if (node.cellType == DPCellType.Ice && action == DIDNTMOVE)
            {
                probability = SLIPPING_PROB;
            } else if (node.cellType == DPCellType.Ice && action == actionAccordingToPolicy)
            {
                probability = 1.0 - SLIPPING_PROB;
            } else if (action != actionAccordingToPolicy)
            {
               probability = 0.0;
            }

            return probability;
        }

        // The current reward model is 0 if arriving in the goal state, else -1
        private static int rewardForState(CytoscapeNode node, int goalID)
        {
            if (node.id == goalID)
                return 0;
            return -1;
        }

        // Determine the new state if the current policy is applied to the current node
        // Will return the same node if the current policy instructs to move into a wall
        private static CytoscapeNode getNewState(Dictionary<Tuple<int, int>, CytoscapeNode> nodeMap, int action, CytoscapeNode currentNode)
        {
            // Ignore walls, goal state is absorbing
            if (currentNode.cellType == DPCellType.Wall || currentNode.cellType == DPCellType.Goal || action == DIDNTMOVE)
            {
                return currentNode;
            }

            // First determine what direction the action is. If the new state is a wall then return the current node
            // otherwise return the new state
            Tuple<int, int> newCoords = new Tuple<int, int>(0,0);
            switch (action)
            {
                case LEFT:
                    newCoords = new Tuple<int, int>(currentNode.x - 1, currentNode.y);
                    break;
                case RIGHT:
                    newCoords = new Tuple<int, int>(currentNode.x + 1, currentNode.y);
                    break;
                case TOP:
                    newCoords = new Tuple<int, int>(currentNode.x, currentNode.y - 1);
                    break;
                case BOTTOM:
                    newCoords = new Tuple<int, int>(currentNode.x, currentNode.y + 1);
                    break;
                default:
                    throw new Exception("Attempting to take an invalid action.");
            }

            if (nodeMap[newCoords].cellType == DPCellType.Wall)
            {
                return currentNode;
            }
            else
            {
                return nodeMap[newCoords];
            }
        }

        // Look at each policy entry, update it to make sure it is pointing in the direction
        // of the highest value element next to it
        private static List<int> updatePolicy(List<int> policy, List<double> values, Dictionary<Tuple<int, int>, CytoscapeNode> nodeMap, Dictionary<int, CytoscapeNode> nodeIDMap)
        {
            List<int> newPolicy = new List<int>();

            // Look at every state-entry in the policy
            // Find the corresponding value for that state
            // Find the max value surround that state from left, right, top, bottom
            // Assign the new policy the action that provides the max value
            CytoscapeNode node, tempNextNode;
            double max;
            int action;
            for (int i = 0; i < policy.Count; i++)
            {
                action = policy[i];
                max = Int32.MinValue;
                node = nodeIDMap[i];

                // Ignore walls
                if (node.cellType == DPCellType.Wall)
                {
                    newPolicy.Add(action);
                    continue;
                }

                // Check Left
                tempNextNode = nodeMap[new Tuple<int,int>(node.x - 1, node.y)];
                if (tempNextNode.cellType != DPCellType.Wall && values[tempNextNode.id] > max)
                {
                    action = LEFT;
                    max = values[tempNextNode.id];
                }

                // Check Right
                tempNextNode = nodeMap[new Tuple<int, int>(node.x + 1, node.y)];
                if (tempNextNode.cellType != DPCellType.Wall && values[tempNextNode.id] > max)
                {
                    action = RIGHT;
                    max = values[tempNextNode.id];
                }

                // Check Top
                tempNextNode = nodeMap[new Tuple<int, int>(node.x, node.y - 1)];
                if (tempNextNode.cellType != DPCellType.Wall && values[tempNextNode.id] > max)
                {
                    action = TOP;
                    max = values[tempNextNode.id];
                }

                // Check Bottom
                tempNextNode = nodeMap[new Tuple<int, int>(node.x, node.y + 1)];
                if (tempNextNode.cellType != DPCellType.Wall && values[tempNextNode.id] > max)
                {
                    action = BOTTOM;
                    max = values[tempNextNode.id];
                }

                newPolicy.Add(action);
            }

            return newPolicy;
        }

        // Returns a random policy
        private static List<int> initializePolicy(CytoscapeParams cyParams)
        {
            List<int> initialPolicy = new List<int>();
            Random rng = new Random();

            for (int i = 0; i < cyParams.nodes.Count; i++)
            {
                // Ensure walls are not given a valid policy
                if (cyParams.nodes[i].cellType != DPCellType.Wall)
                {
                    initialPolicy.Add(rng.Next(0, 4));
                }
                else
                {
                    initialPolicy.Add(-1);
                }
            }

            return initialPolicy;
        }

        private static Animation sampleData(int startID, int goalID, CytoscapeParams cyParams)
        {
            Animation results = new Animation();
            List<AnimationFrame> frames = new List<AnimationFrame>();

            DPAnimationFrame frame;
            int numFrames = 3;
            List<double> currentIteration;
            List<int> currentPolicy;
            List<List<double>> calculationRound;
            Random rng = new Random();
            int iterationNum = 0;
            for (int j = 0; j < numFrames; j++)
            {
                // Initialize new frame
                frame = new DPAnimationFrame();

                // Populate the policy for this round
                currentPolicy = new List<int>();
                for (int i = 0; i < cyParams.nodes.Count; i++)
                {
                    // Ensure walls are not given a valid policy
                    if (cyParams.nodes[i].cellType != DPCellType.Wall)
                    {
                        currentPolicy.Add(rng.Next(0, 4));
                    }
                    else
                    {
                        currentPolicy.Add(-1);
                    }
                }

                // Populate the values for this round
                calculationRound = new List<List<double>>();
                for (int k = 0; k < 3; k++)
                {
                    iterationNum++;
                    currentIteration = new List<double>();
                    for (int l = 0; l < cyParams.nodes.Count; l++)
                    {
                        if (cyParams.nodes[l].cellType != DPCellType.Wall)
                        {
                            currentIteration.Add(iterationNum);
                        }
                        else
                        {
                            currentIteration.Add(-1);
                        }
                    }
                    calculationRound.Add(currentIteration);
                }

                // Set and add the frame
                frame.values = calculationRound;
                frame.policy = currentPolicy;
                frames.Add(frame);
            }

            results.frames = frames;

            return results;
        }
    }
}