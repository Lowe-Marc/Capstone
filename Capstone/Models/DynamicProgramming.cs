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
            DPAnimationFrame frame = new DPAnimationFrame();
            frame.values = new List<int>();
            frame.policy = new List<int>();
            for (int i = 0; i < cyParams.nodes.Count; i++)
            {
                frame.values.Add(i);
                frame.policy.Add(i % 4);
            }
            frames.Add(frame);

            results.frames = frames;

            return results;
        }
    }
}