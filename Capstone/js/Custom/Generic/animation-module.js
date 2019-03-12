(function() {
    // Generic animation module constructor
    function genericAnimationModule() {
        /*
        Animate a single node to a single color. Note that opacity will always be 1

        node: the node to animate
        color: the color the node should animate to
        time: number of ms the animation should take
        */
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

        /*
        Animate a single node to contain an image.

        node: the node to animate
        image: the image the node should display
        */
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

        /*
        Eliminate an image being displayed by turning its opacity to 0.

        node: the node to animate
        image: the image the node should remove
        */
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

        /*
        Utility method to set a callback to occur when an animation completes.

        anim: animation to call callbackFunction when the animation has completed.
        callbackFunction: function to call on animation completion
        functionParams: list of parameters to pass the callbackFunction
        */
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