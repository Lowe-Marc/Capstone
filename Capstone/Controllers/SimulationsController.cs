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

            Animation animation = Models.AStar.runSimulation(startID, goalID);

            return new JavaScriptSerializer().Serialize(animation);
        }
    }
}
