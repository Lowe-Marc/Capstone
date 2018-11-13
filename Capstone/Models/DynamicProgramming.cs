using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Capstone.Models
{
    public class DynamicProgramming
    {
        public static Animation runSimulation(CytoscapeParams cyParams)
        {
            Animation results = new Animation();
            List<AnimationFrame> frames = new List<AnimationFrame>();

            results.frames = frames;

            return results;
        }
    }
}