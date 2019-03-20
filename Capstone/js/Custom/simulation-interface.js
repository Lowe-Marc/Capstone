var SimulationInterface = {
    // The name of the simulation endpoint currently being viewed by the user
    currentSimulation: "",
    // Maps simulation names to an object containing the modules available for that simulation
    availableModules: {},
    // When a generic module is loaded it adds its constructor to this list, so subclasses can call it
    genericConstructors: {},
    // The configuration module for the currently loaded simulation
    configurationModule: null,
    // The toolbar module for the currently loaded simulation
    toolbarModule: null,
    // The animation module for the currently loaded simulation
    animationModule: null,
    // Object containing the results return from a simulation endpoint
    simulationResults: null,
    // This is the object that contains all information about the cytoscape display
    cy: null,

    /* 
    Typically called from a View, this will load all relevant information for a simulation
    simulationName: String containing the name of the simulation, it is expected this matches the endpoint name
    configs: Object C# configuration objects serialized into JSON
    */
    setCurrentSimulation: function(simulationName, configs) {
        this.currentSimulation = simulationName;
        this.configurationModule = this.availableModules[simulationName].configuration;
        this.toolbarModule = this.availableModules[simulationName].toolbar;
        this.animationModule = this.availableModules[simulationName].animation;

        this.configurationModule.defaultConfigs = configs;
        this.configurationModule.setConfigurationsInSelector(configs);
        this.toolbarModule.enableToolbar();
    },

    /*
    The generic toolbar module associates clicking the simulate button with calling this.
    Enables the rest of the buttons that are not intended to be used prior to receiving simulation results.
    */
    runSimulation: function() {
        console.log("running simulation:")
        var config = this.configurationModule.collectConfig();
        console.log("params:", config)
        $.ajax({
            method: "POST",
            url: "/Simulations/" + this.currentSimulation,
            data: { "data": JSON.stringify(config) },
            dataType: "json",
            success: (result) => {
                console.log("Simulation has completed successfully.");
                SimulationInterface.simulationResults = result
                console.log("simulationResults", SimulationInterface.simulationResults);
                result.config = config;
                this.animationModule.loadResults(result);
            },
            error: (result) => {
                console.log("Simulation has completed unsuccessfully.");
                console.log(result);
            }
        });

        $('#iteration-forward').removeClass('disabled');
        $('#iteration-backward').removeClass('disabled');
        $('#iteration-play').removeClass('disabled');
        $('#forward').removeClass('disabled');
        $('#backward').removeClass('disabled');
        $('#play').removeClass('disabled');
    },
}