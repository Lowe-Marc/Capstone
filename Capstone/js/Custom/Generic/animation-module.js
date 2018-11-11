(function() {

    function genericAnimationModule() {
        this.animateNodeToColor  = function(node, color) {
            var anim = node.animation({
                style: {
                    'background-color': color,
                },
                duration: this.animationTime()
            });
            return anim;
        }

        // Time in ms it takes for each animation in a frame to activate
        this.animationTime = function() {
            return 200;
        }
    }

    // Give interface a handle to the generic animation module constructor
    SimulationInterface.genericConstructors.animation = genericAnimationModule;
})();