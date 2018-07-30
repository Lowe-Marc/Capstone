using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.InteropServices;
using System.Web.Hosting;
using Microsoft.Win32.SafeHandles;



namespace Capstone.Models
{
    struct AStarCYNode
    {
        string id;
        double x;
        double y;
    };

    struct AStarCYEdge
    {
        string source;
        string target;
        double distance;
        double heuristicValue;
    };

    struct AStarCYAnimationFrame
    {
        AStarCYNode[] nodes;
        AStarCYEdge[] edges;
    };

    public class Simulations
    {
        private const string SIMULATIONS_DLL = "Capstone.Simulations.dll";

        [DllImport(SIMULATIONS_DLL)]
        static unsafe extern bool ReleaseAnimations(IntPtr animationsHandle);

        static unsafe extern bool GenerateAnimations(out AnimationsHandle handle,
            out AStarCYAnimationFrame frames, out int frameCount);


        [DllImport(SIMULATIONS_DLL)]
        static public extern IntPtr CreateAStar();

        [DllImport(SIMULATIONS_DLL)]
        static public extern void DeleteAStar(IntPtr astar);

        [DllImport(SIMULATIONS_DLL)]
        static public extern int Simulate(IntPtr astar);

        private class AnimationsHandle : SafeHandleZeroOrMinusOneIsInvalid
        {
            public AnimationsHandle() : base(true)
            {

            }

            protected override bool ReleaseHandle()
            {
                return ReleaseAnimations(handle);
            }
        }
    }
}