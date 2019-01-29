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
            CytoscapeParams cyParams = json.ToObject<CytoscapeParams>();
            Animation animation = new Animation();
            if (cyParams.startID == cyParams.goalID)
                return new JavaScriptSerializer().Serialize(animation);

            animation = Models.AStar.runSimulation(cyParams.startID, cyParams.goalID, cyParams);
            return new JavaScriptSerializer().Serialize(animation);
        }

        public Object SaveAStarConfiguration(FormCollection collection)
        {
            string s = collection["data"].ToString();
            JObject json = JObject.Parse(s);
            //CytoscapeParams cyParams = json.ToObject<CytoscapeParams>();

            Response.Cookies.Add(new HttpCookie(json.Root.First().First().ToString(), json.ToString()));
            return true;
        }

        public Object DynamicProgramming(FormCollection collection)
        {
            string s = collection["data"].ToString();
            JObject json = JObject.Parse(s);
            CytoscapeParams cyParams = json.ToObject<CytoscapeParams>();
            Animation animation = new Animation();
            if (cyParams.startID == cyParams.goalID)
                return new JavaScriptSerializer().Serialize(animation);

            animation = Models.DynamicProgramming.runSimulation(cyParams);
            return new JavaScriptSerializer().Serialize(animation);
        }

        public Object ReinforcementLearning(FormCollection collection)
        {
            string s = collection["data"].ToString();
            JObject json = JObject.Parse(s);
            CytoscapeParams cyParams = json.ToObject<CytoscapeParams>();
            Animation animation = new Animation();
            if (cyParams.startID == cyParams.goalID)
                return new JavaScriptSerializer().Serialize(animation);

            animation = Models.DynamicProgramming.runSimulation(cyParams);
            return new JavaScriptSerializer().Serialize(animation);
        }
    }
}
