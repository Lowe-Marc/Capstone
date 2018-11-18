(function() {

    function DPAnimationModule() {
        SimulationInterface.genericConstructors.animation.call(this);

        
    }

    // Give the simulation interface an instance of the module
    SimulationInterface.availableModules.DynamicProgramming.animation = new DPAnimationModule();
})();