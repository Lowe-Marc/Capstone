using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Capstone.Models
{
    public class ReinforcementLearning
    {
        const int QLEARNING_EPISODE = 0;
        const int SARSA_EPISODE = 1;
        const int UP = 0, DOWN = 1, LEFT = 2, RIGHT = 3, DIDNTMOVE = 4;
        const double GAMMA = 0.9;
        const double ALPHA = 1.0;
        static int startID, goalID;
        static CytoscapeNode startNode, goalNode;
        static double epsilon;
        static int timeHorizon;
        // Q maps a state action pair to a value
        static Dictionary<Tuple<CytoscapeNode, int>, double> Q;
        // Map the coordinates of a node to itself
        static Dictionary<Tuple<int, int>, CytoscapeNode> nodeMap;
        // Map the ID of a node to itself
        static Dictionary<int, CytoscapeNode> nodeIDMap;

        public static Animation runSimulation(CytoscapeParams cyParams)
        {
            Animation results = new Animation();
            List<List<int>> QLearning = new List<List<int>>();
            List<List<int>> SARSA = new List<List<int>>();

            int numEpisodes = cyParams.nodes.Count * 3;
            timeHorizon = cyParams.nodes.Count * 3;

            // Setup maps from coordinates or ID to the nodes
            nodeMap = new Dictionary<Tuple<int, int>, CytoscapeNode>();
            nodeIDMap = new Dictionary<int, CytoscapeNode>();
            for (int i = 0; i < cyParams.nodes.Count; i++)
            {
                Tuple<int, int> coords = new Tuple<int, int>(cyParams.nodes[i].x, cyParams.nodes[i].y);
                nodeMap.Add(coords, cyParams.nodes[i]);
                nodeIDMap.Add(i, cyParams.nodes[i]);
            }

            epsilon = 0.9;
            startID = cyParams.startID;
            goalID = cyParams.goalID;
            startNode = nodeIDMap[startID];
            goalNode = nodeIDMap[goalID];

            Tuple<List<int>, int> QLearningActionRewardPair;
            Tuple<List<int>, int> SARSAActionRewardPair;
            List<List<int>> QLearningPolicyOverTime = new List<List<int>>();
            List<List<int>> SARSAPolicyOverTime = new List<List<int>>();
            results.frames = new List<AnimationFrame>();
            for (int episodeNumber = 0; episodeNumber < numEpisodes; episodeNumber++)
            {
                // Run the episode for each algorithm
                QLearningActionRewardPair = runEpisode(QLEARNING_EPISODE);
                SARSAActionRewardPair = runEpisode(SARSA_EPISODE);

                // Epsilon will die off over time
                if (episodeNumber >= 10 && episodeNumber % 10 == 0)
                {
                    epsilon = 0.9 / (episodeNumber / 10);
                    if (epsilon <= 0.009)
                        epsilon = 0.0;
                }

                // Store each policy and its reward
                QLearningPolicyOverTime.Add(QLearningActionRewardPair.Item1);
                SARSAPolicyOverTime.Add(SARSAActionRewardPair.Item1);

                // An animation frame will be either the QLearning or SARSA policy over time
                RLAnimationFrame frame = new RLAnimationFrame();
                frame.QLearning = QLearningActionRewardPair.Item1;
                frame.SARSA = SARSAActionRewardPair.Item1;
                results.frames.Add(frame);
            }

            return results;
        }

        /*
         This will handle the functioning of each episode. For each episode we initialize the current position
         and the first action, then until we find the goal or we have done N iterations we get the next state,
         the reward, the next action, and make our bellman calculations to update Q.

         This will return the reward gained in the episode and the sequence of actions taken
        */
        private static Tuple<List<int>, int> runEpisode(int algorithm)
        {
            int a, aPrime, episodeIteration, reward;
            CytoscapeNode s, sPrime;
            List<int> actions = new List<int>();

            bool goalFound = false;
            s = startNode;
            a = epsilonGreedyAction(s, s);
            reward = 0;
            episodeIteration = 0;

            while (episodeIteration < timeHorizon && !goalFound)
            {
                // Record the action
                actions.Add(a);
                //Observe the next state and its reward
                sPrime = getNewState(s, a);
                goalFound = (sPrime == goalNode);
                reward += getStateReward(sPrime);
                //Determine the next action
                aPrime = epsilonGreedyAction(sPrime, s);
                //Adjust Q
                if (algorithm == SARSA_EPISODE)
                    sarsaBellmanCalculation(s, a, sPrime, aPrime, reward);
                else
                    qLearningBellmanCalculation(s, a, reward);
                //Assign new state-action pair
                a = aPrime;
                s = sPrime;

                if (s == goalNode)
                    goalFound = true;

                episodeIteration++;
            }

            return new Tuple<List<int>, int>(actions, reward);
        }

        /*
         Chooses an action that is random with probability epsilon, otherwise it is chosen greedily.
        */
        private static int epsilonGreedyAction(CytoscapeNode currentPos, CytoscapeNode previousPos)
        {
            Random random = new Random();
            double prob = random.NextDouble();
            int temp;
            if (prob < epsilon)
            {
                temp = randomAction();
            }
            else
            {
                temp = greedyAction(currentPos);
            }
            return temp;
        }

        /*
         Helper method to generate a random action
        */
        private static int randomAction()
        {
            Random random = new Random();
            double prob = random.NextDouble();
            if (prob < 0.25)
                return UP;
            else if (prob < 0.5)
                return DOWN;
            else if (prob < 0.75)
                return LEFT;
            else
                return RIGHT;
        }

        /*
         Chooses the most greedy action (action towards highest Q) based off the current 
         position and the surrounding locations. Ties are broken randomly.
        */
        private static int greedyAction(CytoscapeNode currentPos)
        {
            Random random = new Random();
            int action = (int)(random.NextDouble()*4);
            double max = Q[new Tuple<CytoscapeNode, int>(currentPos, action)];
            double QValue;
            List<int> tiedActions = new List<int>();

            // Look at each direction
            for (int i = 0; i < 4; i++)
            {
                QValue = Q[new Tuple<CytoscapeNode, int>(currentPos, i)];
                if (QValue > max)
                {
                    max = QValue;
                    action = i;
                    // Have to reset the tiedAction list once a new max has been found
                    tiedActions = new List<int>();
                    tiedActions.Add(i);
                }
                else if (QValue == max)
                    tiedActions.Add(i);
            }

            int tieBreakerIndex = 0;
            if (tiedActions.Count > 1)
            {
                tieBreakerIndex = (int)(random.NextDouble() * tiedActions.Count);
                action = tiedActions[tieBreakerIndex];
            }

            return action;
        }



        /* Determine the new state if the current policy is applied to the current node
         * Will return the same node if the current policy instructs to move into a wall
         */
        private static CytoscapeNode getNewState(CytoscapeNode currentNode, int action)
        {
            // Ignore walls, goal state is absorbing
            if (currentNode.cellType == DPCellType.Wall || currentNode.cellType == DPCellType.Goal || action == DIDNTMOVE)
            {
                return currentNode;
            }

            // First determine what direction the action is. If the new state is a wall then return the current node
            // otherwise return the new state
            Tuple<int, int> newCoords = new Tuple<int, int>(0, 0);
            switch (action)
            {
                case LEFT:
                    newCoords = new Tuple<int, int>(currentNode.x - 1, currentNode.y);
                    break;
                case RIGHT:
                    newCoords = new Tuple<int, int>(currentNode.x + 1, currentNode.y);
                    break;
                case UP:
                    newCoords = new Tuple<int, int>(currentNode.x, currentNode.y - 1);
                    break;
                case DOWN:
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

        private static int getStateReward(CytoscapeNode newNode)
        {
            if (newNode.cellType == DPCellType.Hole)
            {
                return -100;
            } else if (newNode == goalNode)
            {
                return 100;
            } else
            {
                return -1;
            }
        }

        /*
         Position and action here are the state action pair (s',a')
         Q(s, a) = Q(s, a) + alpha*[r + gamma*Q(s', a') - Q(s, a)]
        */
        private static void sarsaBellmanCalculation(CytoscapeNode s, int a, CytoscapeNode sPrime, int aPrime, int reward)
        {
            Tuple<CytoscapeNode, int> stateActionPair = new Tuple<CytoscapeNode, int>(s, a);
            Tuple<CytoscapeNode, int> stateActionPairPrime = new Tuple<CytoscapeNode, int>(sPrime, aPrime);
            Q[stateActionPair] = Q[stateActionPair] + ALPHA * (reward + GAMMA * Q[stateActionPairPrime] - Q[stateActionPair]);
        }

        /*
         Position and action here are the state action pair (s',a')
         Q(s, a) = Q(s, a) + gamma[r + argMaxa'Q(s', a')Q(s, a)]
        */
        private static void qLearningBellmanCalculation(CytoscapeNode s, int a, int reward)
        {
            Tuple<CytoscapeNode, int> stateActionPair = new Tuple<CytoscapeNode, int>(s, a);
            int aPrime = argMax(s);
            CytoscapeNode sPrime = getNewState(s, a);
            Tuple<CytoscapeNode, int> stateActionPairPrime = new Tuple<CytoscapeNode, int>(sPrime, aPrime);
            Q[stateActionPair] = Q[stateActionPair] + ALPHA * (reward + GAMMA * Q[stateActionPairPrime] - Q[stateActionPair]);
        }

        /*
         Returns the action that will provide the highest reward given position
        */
        private static int argMax(CytoscapeNode currentPosition)
        {
            int max = Int32.MinValue;
            CytoscapeNode possiblePosition;
            int reward, action = 0;

            //4 possible actions
            for (int i = 0; i < 4; i++)
            {
                possiblePosition = getNewState(currentPosition, i);
                reward = getStateReward(possiblePosition);
                if (reward > max)
                {
                    max = reward;
                    action = i;
                }
            }
            return action;
        }
    }
}