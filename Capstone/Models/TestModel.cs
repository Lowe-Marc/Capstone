using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Web;


namespace Capstone.Models
{
    public class TestModel
    {
        [StructLayout(LayoutKind.Sequential)]
        public struct TestAnimationStruct
        {
            public int[] values;
        }

        private const string SIMULATIONS_DLL = "C:\\Users\\Marcus\\School\\Capstone\\Capstone\\Debug\\Capstone.Simulations.dll";

        [DllImport(SIMULATIONS_DLL)]
        static public extern IntPtr CreateTest();

        [DllImport(SIMULATIONS_DLL)]
        static public extern void DeleteTest(IntPtr test);

        [DllImport(SIMULATIONS_DLL)]
        static public extern int TestRunSim(IntPtr test);

        [DllImport(SIMULATIONS_DLL)]
        static public extern bool TestGetResults(IntPtr test, int[] structToAssign);
    }
}