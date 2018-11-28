(function() {

    function DPToolbarModule() {
        SimulationInterface.genericConstructors.toolbar.call(this);

        var self = this;

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
            content += '</div>';
            $('#simulation-config').html(content);
            $('#simulation-config').show();
            // $('#simulation-config').height($('#simulation-display').height() - this.simulationConfigBottomBorder());
            $('#simulation-config').height(600 - this.simulationConfigBottomBorder());
            this.setCalculationAnimations();
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
                    // SimulationInterface.animationModule.configAnimPaused = false;
                    // SimulationInterface.animationModule.playIterations();
                }
            });

            $('#pause').click(function() {
                if (!$('#pause').hasClass('disabled')) {
                    // SimulationInterface.animationModule.configAnimPaused = true;
                    $('#pause').addClass('disabled');
                    $('#play').removeClass('disabled');
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

    }

    // Give the simulation interface an instance of the module
    SimulationInterface.availableModules.DynamicProgramming.toolbar = new DPToolbarModule();
})();