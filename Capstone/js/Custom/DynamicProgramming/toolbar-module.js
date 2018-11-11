(function() {

    function DPToolbarModule() {
        SimulationInterface.genericConstructors.toolbar.call(this);
    }

    // Give the simulation interface an instance of the module
    SimulationInterface.availableModules.DynamicProgramming.toolbar = new DPToolbarModule();
})();