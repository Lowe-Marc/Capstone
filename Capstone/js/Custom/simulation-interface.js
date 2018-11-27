var SimulationInterface = {
    currentSimulation: "",
    availableSimulations: {},
    availableModules: {},
    genericConstructors: {},
    configurationModule: null,
    toolbarModule: null,
    animationModule: null,
    simulationResults: null,

    cy: null,

    setCurrentSimulation: function(simulationName, configs) {
        this.currentSimulation = simulationName;
        this.configurationModule = this.availableModules[simulationName].configuration;
        this.toolbarModule = this.availableModules[simulationName].toolbar;
        this.animationModule = this.availableModules[simulationName].animation;

        this.configurationModule.defaultConfigs = configs;
        this.configurationModule.setConfigurationsInSelector(configs);
        this.toolbarModule.enableToolbar();
    },

    runSimulation: function() {
        console.log("running simulation:")
        $.ajax({
            method: "POST",
            url: "/Simulations/" + this.currentSimulation,
            data: { "data": JSON.stringify({}) },
            dataType: "json",
            success: (result) => {
                console.log("Simulation has completed successfully.");
                SimulationInterface.simulationResults = result
                console.log("simulationResults", simulationResults);
            },
            error: (result) => {
                console.log("Simulation has completed unsuccessfully.");
                console.log(result);
            }
        });

        this.toolbarModule.testResults();
        // $('#iteration-forward').removeClass('disabled');
        // $('#iteration-backward').removeClass('disabled');
        // $('#iteration-play').removeClass('disabled');
        // $('#forward').removeClass('disabled');
    },
}