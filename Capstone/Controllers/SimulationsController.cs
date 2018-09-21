using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using Capstone.Models;

using System.Web.Script.Serialization;

namespace Capstone.Controllers
{
    public class SimulationsController : Controller
    {

        /*
         * Note that the parameters in collection must match the parameter names in collectAStarParams()
         */
        public Object AStar(FormCollection collection)
        {

            int startID = Convert.ToInt32(collection["startID"]);
            int goalID = Convert.ToInt32(collection["goalID"]);

            int[][] debug = new int[2][];

            int[] debug_frame_0 = { startID };
            debug[0] = debug_frame_0;

            int[] debug_frame_1 = { goalID };
            debug[1] = debug_frame_1;

            return new JavaScriptSerializer().Serialize(debug);

            ////IntPtr testCppObj = Simulations.CreateAStar();
            ////return Simulations.Simulate(testCppObj);

            //int[][] configs = new int[4][];

            //int[] frame_1 = { 0 };
            //configs[0] = frame_1;

            //int[] frame_2 = { 0, 1 };
            //configs[1] = frame_2;

            //int[] frame_3 = { 0, 1, 2 };
            //configs[2] = frame_3;

            //int[] frame_4 = { 0, 1, 2, 3 };
            //configs[3] = frame_4;

            //return new JavaScriptSerializer().Serialize(configs);
        }
    }
}