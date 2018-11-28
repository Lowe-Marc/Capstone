using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Capstone.Models
{
    public class DynamicProgramming
    {
        public static Animation runSimulation(int startID, int goalID, CytoscapeParams cyParams)
        {
            Animation results = new Animation();
            List<AnimationFrame> frames = new List<AnimationFrame>();

            DPAnimationFrame frame;
            int numFrames = 3;
            List<int> currentIteration, currentPolicy;
            List<List<int>> calculationRound;
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
                    currentPolicy.Add(rng.Next(0, 4));
                }

                // Populate the values for this round
                calculationRound = new List<List<int>>();
                for (int k = 0; k < 3; k++)
                {
                    iterationNum++;
                    currentIteration = new List<int>();
                    for (int l = 0; l < cyParams.nodes.Count; l++)
                    {
                        currentIteration.Add(iterationNum);
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