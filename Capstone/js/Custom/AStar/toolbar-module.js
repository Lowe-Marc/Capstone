(function() {

    function AStarToolbarModule() {
        SimulationInterface.genericConstructors.toolbar.call(this);

        var self = this;

        this.setConfig = function() {
            var content = '';

            content += '<div class="notation pull-right">'
            content += '<ul class="list-inline list-unstyled">'
            content += '<li class="legend-item"><span class="active-label"></span>Active</li>'
            content += '<li class="legend-item"><span class="inconsistent-label"></span>Inconsistent</li>'
            content += '<li class="legend-item"><span class="inadmissible-label"></span>Inadmissible</li>'
            content += '<li class="legend-item"><span class="inadmissible-and-inconsistent-label"></span>Inconsistent & Inadmissible</li>'
            content += '<li> Start: <label id="start-label"></label><label id="start-id" style="display:none">-1</label></li>';
            content += '<li> Goal: <label id="goal-label"></label><label id="goal-id" style="display:none">-1<label></li>';
            content += '<li><label id="priority-queue-label"><u>Priority Queue</u></label></li>';
            content += '<li id="priority-queue-div"></li>';
            content += '</ul>'
            content += '</div>'

            $('#simulation-config').html(content);
            $('#simulation-config').show();
            $('#simulation-config').height(600 - this.simulationConfigBottomBorder());
            this.setAnimationButtonFunctionality();
            this.adjustDefaultToolbar();
        }

        this.setAnimationButtonFunctionality = function() {
            $('#forward').click(function() {
                if (!$('#forward').hasClass('disabled')) {
                    SimulationInterface.animationModule.enablePauseControls();
                    SimulationInterface.animationModule.frameForward();
                }
            });

            $('#backward').click(function() {
                if (!$('#backward').hasClass('disabled')) {
                    SimulationInterface.animationModule.enablePauseControls();
                    SimulationInterface.animationModule.frameBackward();
                }
            });

            $('#play').click(function() {
                if (!$('#play').hasClass('disabled')) {
                    SimulationInterface.animationModule.play();
                }
            });

            $('#pause').click(function() {
                if (!$('#pause').hasClass('disabled')) {
                    SimulationInterface.animationModule.pause();
                }
            });

            $('#frame-tracker').keypress(function (e) {
                if (e.which == 13) {
                    var frameToPlay = parseInt($('#frame-tracker').val());
                    SimulationInterface.animationModule.seekToFrame(frameToPlay);
                }
            })
        }

        this.adjustDefaultToolbar = function() {
            
        }

    }

    // Give the simulation interface an instance of the module
    SimulationInterface.availableModules.AStar.toolbar = new AStarToolbarModule();
})();