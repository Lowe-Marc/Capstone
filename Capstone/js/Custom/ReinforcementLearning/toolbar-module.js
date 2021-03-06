(function() {

    function RLToolbarModule() {
        SimulationInterface.genericConstructors.toolbar.call(this);

        var self = this;

        this.validateTheta = function(value) {
            console.log("value", value)
            if (value < 0.0001) {
                // $('#theta-value').
            }
        }

        this.setConfig = function() {
            var content = '';
            content += '<div class="notation pull-right dp-config-div">';
            
            content += '<div>';
            content += '<input type="radio" name="simulation-type" value="q-learning" checked="checked"> Q-Learning<br>';
            content += '<input type="radio" name="simulation-type" value="sarsa"> SARSA<br>';
            content += '<input type="checkbox" name="show-agent" value="show-agent" id="show-agent"> Show Agent<br>';
            content += '</div>';
            content += '</div>';
            content += '</div>';

            $('#simulation-config').html(content);
            $('#simulation-config').show();
            // $('#simulation-config').height($('#simulation-display').height() - this.simulationConfigBottomBorder());
            $('#simulation-config').height(600 - this.simulationConfigBottomBorder());
            this.setCalculationAnimations();
            this.adjustDefaultToolbar();
        }

        this.animationMenu = function() {
            var menu = '';
            menu += '<div class="operation">';
            menu += '<div class="svg-expand pointer second">';
            menu += '<span class="fa oi icon disabled" id="iteration-play" data-glyph="media-play" title="Play Calculation" aria-hidden="true"></span>';
            menu += '<span class="fa oi icon disabled" id="iteration-pause" data-glyph="media-pause" title="Pause Calculation" aria-hidden="true"></span>';
            menu += '<span class="fa oi icon disabled" id="iteration-backward" data-glyph="media-skip-backward" title="Move Back a Calculation" aria-hidden="true"></span>';
            menu += '<span class="fa oi icon disabled" id="iteration-forward" data-glyph="media-skip-forward" title="Move Forward a Calculation" aria-hidden="true"></span>';
            menu += '</div>';
            menu += '</div>';
            return menu;
        }

        this.setCalculationAnimations = function() {
            $('#forward').unbind();
            $('#forward').click(function() {
                if (!$('#forward').hasClass('disabled')) {
                    SimulationInterface.animationModule.displayNextEpisode();
                }
            });

            $('#backward').unbind();
            $('#backward').click(function() {
                if (!$('#backward').hasClass('disabled')) {
                    SimulationInterface.animationModule.displayPreviousEpisode();
                }
            });

            $('#play').unbind();
            $('#play').click(function() {
                if (!$('#play').hasClass('disabled')) {
                    $('#play').addClass('disabled');
                    $('#pause').removeClass('disabled');
                    $('#show-agent').attr("disabled", true);
                    SimulationInterface.animationModule.learningPaused = false;
                    SimulationInterface.animationModule.displayNextEpisode();
                }
            });

            $('#pause').unbind();
            $('#pause').click(function() {
                if (!$('#pause').hasClass('disabled')) {
                    $('#pause').addClass('disabled');
                    $('#play').removeClass('disabled');
                    $('#show-agent').removeAttr('disabled');
                    SimulationInterface.animationModule.learningPaused = true;
                }
            });

            $('input[type=radio][name=simulation-type]').unbind();
            $('input[type=radio][name=simulation-type]').change(function() {
                SimulationInterface.animationModule.setSimulationType(this.value);
            });

            $('#frame-tracker').unbind();
            $('#frame-tracker').keypress(function (e) {
                if (e.which == 13) {
                    var frameToPlay = parseInt($('#frame-tracker').val());
                    if (frameToPlay < SimulationInterface.animationModule.numEpisodes && frameToPlay >= 0)
                        SimulationInterface.animationModule.setCurrentFrame(frameToPlay);
                }
            })
        }

        this.adjustDefaultToolbar = function() {
            $('#lock-locked').hide();
            $('#disable-grid-snapping').hide();
            $('#save-config').hide();
        }

    }

    // Give the simulation interface an instance of the module
    SimulationInterface.availableModules.ReinforcementLearning.toolbar = new RLToolbarModule();
})();