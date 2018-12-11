(function() {

    function DPToolbarModule() {
        SimulationInterface.genericConstructors.toolbar.call(this);

        var self = this;

        this.validateTheta = function(value) {
            console.log("value", value)
            if (value < 0.0001) {
                // $('#theta-value').
            }
        }

        this.setConfig = function() {
            var currentConfig = SimulationInterface.configurationModule.currentConfig;
            var numNodes = currentConfig.nodes.length;
            var i = 0, currentRow = 0, currentCol = 0;
            SimulationInterface.animationModule.currentIterationIndex = 0;
            SimulationInterface.animationModule.currentIterationNumber = 0;
            var content = '';
            content += '<div class="notation pull-right dp-config-div">';
            content += this.animationMenu();
            content += '<table class="table">';
            content += '<tr>';
            for (i = 0; i < numNodes; i++) {
                if (currentConfig.nodes[i].coords.Item2 > currentRow) {
                    currentCol = 0;
                    currentRow++;
                    content += '</tr>';
                    content += '<tr>';
                }
                content += '<td id="iteration-cell-' + i + '">-</td>';
                currentCol++;
            }
            content += '</tr>';
            content += '</table>';
            // Add in delta display
            content += '<div> <label>Gamma: <label id="gamma-value"></label>0.9</label> </div>';
            content += '<div> <label>Theta: <input id="theta-value" type="number" min="0.0001" max="5" step="0.1" onkeyup="if (this.value > 5) {this.value = 5;} else if (this.value < 0.0001 && this.value != 0) {this.value = 0.0001;}"></input></label> </div>';
            content += '<div> <label>Probability of Slipping: <input id="slipping-value" type="number" min="0" max="1.0" step="0.1" onkeyup="if (this.value > 1.0) {this.value = 1.0} else if (this.value < 0) {this.value = 0.0;}"></input></label> </div>';
            content += '<div> <label>Delta: <label id="delta-value"></label></label> </div>';
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
            $('#forward').click(function() {
                if (!$('#forward').hasClass('disabled')) {
                    SimulationInterface.animationModule.forwardPolicy();
                }
            });


            $('#backward').click(function() {
                if (!$('#backward').hasClass('disabled')) {
                    SimulationInterface.animationModule.backwardPolicy();
                }
            });

            $('#play').click(function() {
                if (!$('#play').hasClass('disabled')) {
                    $('#play').addClass('disabled');
                    $('#pause').removeClass('disabled');
                    SimulationInterface.animationModule.learningPaused = false;
                    SimulationInterface.animationModule.automateLearning();
                }
            });

            $('#pause').click(function() {
                if (!$('#pause').hasClass('disabled')) {
                    // SimulationInterface.animationModule.configAnimPaused = true;
                    $('#pause').addClass('disabled');
                    $('#play').removeClass('disabled');
                    SimulationInterface.animationModule.learningPaused = true;
                }
            });

            $('#iteration-forward').click(function() {
                if (!$('#iteration-forward').hasClass('disabled')) {
                    SimulationInterface.animationModule.forwardIterationIndex();
                }
            });

            $('#iteration-backward').click(function() {
                if (!$('#iteration-backward').hasClass('disabled')) {
                    SimulationInterface.animationModule.backwardIterationIndex();
                }
            });

            $('#iteration-play').click(function() {
                if (!$('#iteration-play').hasClass('disabled')) {
                    $('#iteration-play').addClass('disabled');
                    $('#iteration-pause').removeClass('disabled');
                    SimulationInterface.animationModule.configAnimPaused = false;
                    SimulationInterface.animationModule.playIterations();
                }
            });

            $('#iteration-pause').click(function() {
                if (!$('#iteration-pause').hasClass('disabled')) {
                    SimulationInterface.animationModule.pauseIterations();
                }
            });
        }

        this.adjustDefaultToolbar = function() {
            $('#lock-locked').hide();
            $('#disable-grid-snapping').hide();
        }

    }

    // Give the simulation interface an instance of the module
    SimulationInterface.availableModules.DynamicProgramming.toolbar = new DPToolbarModule();
})();