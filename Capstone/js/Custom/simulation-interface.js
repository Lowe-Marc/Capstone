var SimulationInterface = {
    currentSimulation: "",
    availableSimulations: {},
    availableModules: {},
    genericConstructors: {},
    configurationModule: null,
    toolbarModule: null,
    animationModule: null,

    cy: null,

    setCurrentSimulation: function(simulationName, configs) {
        this.currentSimulation = simulationName;
        this.configurationModule = this.availableModules[simulationName].configuration;
        this.toolbarModule = this.availableModules[simulationName].toolbar;
        this.animationModule = this.availableModules[simulationName].animation;

        this.toolbarModule.enableToolbar();
        this.configurationModule.defaultConfigs = configs;
        this.configurationModule.setConfigurationsInSelector(configs);
    },

    runSimulation: function() {

    }
}