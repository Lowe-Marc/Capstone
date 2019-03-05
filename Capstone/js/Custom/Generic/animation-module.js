(function() {

    function genericAnimationModule() {
        this.animateNodeToColor = function(node, color, time) {
            if (time == null)
                time = this.animationTime();
            var anim = node.animation({
                style: {
                    'background-color': color,
                },
                duration: time
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

        this.setAnimCallback = function(anim, callbackFunction, functionParams) {
            anim.promise('completed').then(function() {
                callbackFunction(functionParams);
            })
        }

        // Time in ms it takes for each animation in a frame to activate
        this.animationTime = function() {
            return 200;
        }
    }

    // Give interface a handle to the generic animation module constructor
    SimulationInterface.genericConstructors.animation = genericAnimationModule;
})();