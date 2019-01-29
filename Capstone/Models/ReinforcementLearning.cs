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

        public static Animation runSimulation(CytoscapeParams cyParams)
        {
            Animation results = new Animation();
            List<List<int>> QLearning = new List<List<int>>();
            List<List<int>> SARSA = new List<List<int>>();

            int numEpisodes = cyParams.nodes.Count * 3;
            int timeHorizon = cyParams.nodes.Count * 3;

            // Setup maps from coordinates or ID to the nodes
            Dictionary<Tuple<int, int>, CytoscapeNode> nodeMap = new Dictionary<Tuple<int, int>, CytoscapeNode>();
            Dictionary<int, CytoscapeNode> nodeIDMap = new Dictionary<int, CytoscapeNode>();
            for (int i = 0; i < cyParams.nodes.Count; i++)
            {
                Tuple<int, int> coords = new Tuple<int, int>(cyParams.nodes[i].x, cyParams.nodes[i].y);
                nodeMap.Add(coords, cyParams.nodes[i]);
                nodeIDMap.Add(i, cyParams.nodes[i]);
            }

            double epsilon = 0.9;


            Tuple<List<int>, int> QLearningActionRewardPair;
            Tuple<List<int>, int> SARSAActionRewardPair;
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
            }

            return results;
        }

        private static Tuple<List<int>, int> runEpisode(int algorithm)
        {
            List<int> actions = new List<int>();
            int reward = 0;

            return new Tuple<List<int>, int>(actions, reward);
        }
    }
}