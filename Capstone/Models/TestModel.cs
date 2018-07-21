using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Web;


namespace Capstone.Models
{
    public class TestModel
    {
        [DllImport("C:\\Users\\Marcus\\School\\Capstone\\Capstone\\Debug\\Capstone.Simulations.dll")]
        static public extern IntPtr CreateTest();

        [DllImport("C:\\Users\\Marcus\\School\\Capstone\\Capstone\\Debug\\Capstone.Simulations.dll")]
        static public extern void DeleteTest(IntPtr test);

        [DllImport("C:\\Users\\Marcus\\School\\Capstone\\Capstone\\Debug\\Capstone.Simulations.dll")]
        static public extern int TestFunction(IntPtr test);
    }
}