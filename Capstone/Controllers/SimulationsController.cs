﻿using System;
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

            Animation animation = Models.AStar.runSimulation(cyParams.startID, cyParams.goalID, cyParams);

            return new JavaScriptSerializer().Serialize(animation);
        }
    }
}
