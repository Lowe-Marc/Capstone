using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Web;


namespace Capstone.Models
{
    public class TestModel
    {
        private const string SIMULATIONS_DLL = "Capstone.Simulations.dll";

        [DllImport(SIMULATIONS_DLL)]
        static public extern IntPtr CreateTest();

        [DllImport(SIMULATIONS_DLL)]
        static public extern void DeleteTest(IntPtr test);

        [DllImport(SIMULATIONS_DLL)]
        static public extern int TestFunction(IntPtr test);
    }
}