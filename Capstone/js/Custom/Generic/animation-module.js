(function() {

    function genericAnimationModule() {
        this.animateNodeToColor = function(node, color) {
            var anim = node.animation({
                style: {
                    'background-color': color,
                },
                duration: this.animationTime()
            });
            return anim;
        }

        this.animateNodeToImage = function(node, image) {
            var anim = node.animation({
                style: {
                    'background-image': image,
                    'background-image-opacity': 1.0
                },
                duration: 0
            });
            return anim;
        }

        this.animateNodeToRemoveImage = function(node, image) {
            var anim = node.animation({
                style: {
                    'background-image': image,
                    'background-image-opacity': 0.0
                },
                duration: 0
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