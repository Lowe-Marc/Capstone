(function() {

    function SimulationNameToolbarModule() {
        SimulationInterface.genericConstructors.toolbar.call(this);

        var self = this;

        this.setConfig = function() {
            var content = '';
            
            content += '<div class="notation pull-right dp-config-div">';
            content += '<div>';
            content += 'Sample content';
            content += '</div>';
            content += '</div>';

            $('#simulation-config').html(content);
            $('#simulation-config').show();
            $('#simulation-config').height(600 - this.simulationConfigBottomBorder());
            this.adjustDefaultToolbar();
        }

        this.setCalculationAnimations = function() {
            $('#forward').click(function() {
                if (!$('#forward').hasClass('disabled')) {
                    SimulationInterface.animationModule.displayNextFrame();
                }
            });

            $('#backward').click(function() {
                if (!$('#backward').hasClass('disabled')) {
                    SimulationInterface.animationModule.displayPreviousFrame();
                }
            });

            $('#play').click(function() {
                if (!$('#play').hasClass('disabled')) {
                    $('#play').addClass('disabled');
                    $('#pause').removeClass('disabled');
                    $('#show-agent').attr("disabled", true);
                    SimulationInterface.animationModule.play();
                }
            });

            $('#pause').click(function() {
                if (!$('#pause').hasClass('disabled')) {
                    $('#pause').addClass('disabled');
                    $('#play').removeClass('disabled');
                    $('#show-agent').removeAttr('disabled');
                    SimulationInterface.animationModule.pause();
                }
            });

            $('#frame-tracker').keypress(function (e) {
                if (e.which == 13) {
                    var frameToPlay = parseInt($('#frame-tracker').val());
                    SimulationInterface.animationModule.setCurrentFrame(frameToPlay);
                }
            })
        }

        this.adjustDefaultToolbar = function() {
            $('#lock-locked').hide();
            $('#disable-grid-snapping').hide();
        }

    }

    // Give the simulation interface an instance of the module
    SimulationInterface.availableModules.SimulationName.toolbar = new SimulationNameToolbarModule();
})();