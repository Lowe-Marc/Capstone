(function() {

    function DPToolbarModule() {
        SimulationInterface.genericConstructors.toolbar.call(this);

        var self = this;
        this.currentIterationIndex = 0;
        this.currentIteration = [];

        this.setConfig = function() {
            var currentConfig = SimulationInterface.configurationModule.currentConfig;
            var numNodes = currentConfig.nodes.length;
            var i = 0, currentRow = 0, currentCol = 0;
            var content = '';
            content += '<div class="notation pull-right dp-config-div">'
            content += this.animationMenu();
            content += '<table class="table">'
            content += '<tr>'
            for (i = 0; i < numNodes; i++) {
                if (currentConfig.nodes[i].coords.Item2 > currentRow) {
                    currentCol = 0
                    currentRow++;
                    content += '</tr>'
                    content += '<tr>'
                }
                content += '<td id="iteration-cell-' + i + '">' + currentCol + '</td>'
                currentCol++;
            }
            content += '</tr>'
            content += '</table>'
            content += '</div>'
            $('#simulation-config').html(content)
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
            menu += '<span class="fa oi icon disabled" id="iteration-pause" data-glyph="media-pause" title="Pause Calculation" aria-hidden="true"></span>'
            menu += '<span class="fa oi icon disabled" id="iteration-backward" data-glyph="media-skip-backward" title="Move Back a Calculation" aria-hidden="true"></span>'
            menu += '<span class="fa oi icon disabled" id="iteration-forward" data-glyph="media-skip-forward" title="Move Forward a Calculation" aria-hidden="true"></span>'
            menu += '</div>';
            menu += '</div>';
            return menu;
        }

        this.setCalculationAnimations = function() {
            $('#iteration-forward').click(function() {
                self.forwardIterationIndex();
            });

            $('#iteration-backward').click(function() {
                self.backwardIterationIndex();
            });
        }

        this.forwardIterationIndex = function() {
            console.log(this.currentIterationIndex, this.currentIteration[this.currentIterationIndex])
            if (this.currentIterationIndex < this.currentIteration.length) {
                if (this.currentIterationIndex > 0) {
                    console.log("HERE")
                    $('#iteration-cell-' + (this.currentIterationIndex - 1)).css('background-color', '')    
                }
                $('#iteration-cell-' + this.currentIterationIndex).css('background-color', 'LightSteelBlue')
                $('#iteration-cell-' + this.currentIterationIndex).text(this.currentIteration[this.currentIterationIndex])
                this.currentIterationIndex++;
            }
        }

        this.backwardIterationIndex = function() {
            if (currentIterationIndex > 0) {
                this.currentIterationIndex--;
            }
        }

        this.testResults = function() {
            var currentConfig = SimulationInterface.configurationModule.currentConfig;
            var numNodes = currentConfig.nodes.length;
            var results = [];
            var i, j;
            var iteration;
            for (j = 0; j < 3; j++) {
                iteration = [];
                for (i = 0; i < numNodes; i++) {
                    iteration.push(10);
                }
                results.push(iteration);
            }

            this.currentIteration = results[0];

            SimulationInterface.simulationResults = results;
        }
    }

    // Give the simulation interface an instance of the module
    SimulationInterface.availableModules.DynamicProgramming.toolbar = new DPToolbarModule();
})();