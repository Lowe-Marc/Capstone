(function() {

    function SimulationNameAnimationModule() {
        SimulationInterface.genericConstructors.animation.call(this);

        var self = this;
        this.simulationResults = {};

        this.getDisplayedFrame = function() {
            return $('#frame-tracker').val()
        }
        
        this.setDisplayedFrame = function(frameCount) {
            $('#frame-tracker').val(frameCount)
            var numLength = (frameCount + '').length + 2;
            $('#frame-tracker').width(numLength * 8 + 'px');
        }
        
        this.setMaxFrameCount = function(frameCount) {
            $('#max-frame-count').text("/"+frameCount);
        }
        
        this.setCurrentFrameDisplay = function(frameNumber) {
            $('#frame-tracker').val(frameNumber);
            $('#frame-tracker').width((($('#frame-tracker').val().length + 2) * 8) + 'px');
        }

        this.pause = function() {
            $('#pause').addClass('disabled');
            $('#play').removeClass('disabled');
        }

        this.loadResults = function(results) {
            this.simulationResults = results;
        }


        this.displayNextEpisode = function() {
            
        }

        this.displayPreviousEpisode = function() {
            
        }

        this.displayCurrentFrame = function(episodeNumber) {

        }

        this.removePolicyDisplay = function(callbackFunction, functionParams) {
            var nodes = SimulationInterface.cy.nodes()
            nodes.each(function(element) {
                if (element.id() == nodes[nodes.length-1].id())
                    SimulationInterface.configurationModule.removeImage(element.id(), callbackFunction, functionParams)
                else
                    SimulationInterface.configurationModule.removeImage(element.id())
            })
        }

    }

    // Give the simulation interface an instance of the module
    SimulationInterface.availableModules.SimulationName.animation = new SimulationNameAnimationModule();
})();