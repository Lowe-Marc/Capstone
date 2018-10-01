using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Capstone.Models
{
    public class AStar
    {
        public static Animation runSimulation(int startID, int goalID)
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