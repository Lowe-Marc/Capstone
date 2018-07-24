using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using Capstone.Models;

namespace Capstone.Controllers
{
    public class SimulationsController : Controller
    {
        // GET: Simulations
        public Object AStar()
        {
            IntPtr testCppObj = Simulations.CreateAStar();
            return Simulations.Simulate(testCppObj);
        }
    }
}