using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using Capstone.Models;

using System.Web.Script.Serialization;

using System.Web.Http;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;


namespace Capstone.Controllers
{
    public class SimulationsController : Controller
    {

        /*
         * Note that the parameters in collection must match the parameter names in collectAStarParams()
         */
        public Object AStar(FormCollection collection)
        {
            string s = collection["data"].ToString();
            JObject json = JObject.Parse(s);
            CytoscapeParams debug = json.ToObject<CytoscapeParams>();
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            CytoscapeParams test = new CytoscapeParams();
            test = serializer.Deserialize<CytoscapeParams>(collection["data"].ToString());
            //CytoscapeParams test = JsonConvert.DeserializeObject<CytoscapeParams>(collection["data"].ToString());

            //int startID = Convert.ToInt32(collection["startID"]);
            //int goalID = Convert.ToInt32(collection["goalID"]);
            int startID = test.startID;
            int goalID = test.goalID;

            Animation animation = Models.AStar.runSimulation(startID, goalID);

            return new JavaScriptSerializer().Serialize(animation);
        }
    }
}
