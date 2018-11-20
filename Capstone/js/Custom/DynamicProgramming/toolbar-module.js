(function() {

    function DPToolbarModule() {
        SimulationInterface.genericConstructors.toolbar.call(this);

        var self = this;
        this.currentIterationIndex = 0;
        this.currentIteration = [];
        this.simulationResults = [];
        this.currentIterationNumber = 0;
        this.configAnimPaused = false;

        this.currentPolicy = [];

        this.setConfig = function() {
            var currentConfig = SimulationInterface.configurationModule.currentConfig;
            var numNodes = currentConfig.nodes.length;
            var i = 0, currentRow = 0, currentCol = 0;
            this.currentIterationIndex = 0;
            this.currentIterationNumber = 0;
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
            menu += '<span class="fa oi icon disabled" id="iteration-pause" data-glyph="media-pause" title="Pause Calculation" aria-hidden="true"></span>'
            menu += '<span class="fa oi icon disabled" id="iteration-backward" data-glyph="media-skip-backward" title="Move Back a Calculation" aria-hidden="true"></span>'
            menu += '<span class="fa oi icon disabled" id="iteration-forward" data-glyph="media-skip-forward" title="Move Forward a Calculation" aria-hidden="true"></span>'
            menu += '</div>';
            menu += '</div>';
            return menu;
        }

        this.setCalculationAnimations = function() {
            $('#forward').click(function() {
                if (!$('#forward').hasClass('disabled')) {
                    self.newPolicy();
                }
            });

            $('#iteration-forward').click(function() {
                if (!$('#iteration-forward').hasClass('disabled')) {
                    self.forwardIterationIndex();
                }
            });

            $('#iteration-backward').click(function() {
                if (!$('#iteration-backward').hasClass('disabled')) {
                    self.backwardIterationIndex();
                }
            });

            $('#iteration-play').click(function() {
                if (!$('#iteration-play').hasClass('disabled')) {
                    $('#iteration-play').addClass('disabled');
                    $('#iteration-pause').removeClass('disabled');
                    self.configAnimPaused = false;
                    self.playIterations();
                }
            });

            $('#iteration-pause').click(function() {
                if (!$('#iteration-pause').hasClass('disabled')) {
                    self.configAnimPaused = true;
                    $('#iteration-pause').addClass('disabled');
                    $('#iteration-play').removeClass('disabled');
                }
            });
        }

        this.forwardIterationIndex = function() {
            if (this.currentIterationIndex < this.currentIteration.length) {
                if (this.currentIterationIndex > 0) {
                    $('#iteration-cell-' + (this.currentIterationIndex - 1)).css('background-color', '');
                }
                $('#iteration-cell-' + this.currentIterationIndex).css('background-color', 'LightSteelBlue');
                $('#iteration-cell-' + this.currentIterationIndex).text(this.currentIteration[this.currentIterationIndex]);
                this.currentIterationIndex++;
            } else { // Wrap to next iteration
                // Can't wrap if at final value
                if (this.currentIterationNumber != this.simulationResults.length - 1) {
                    $('#iteration-cell-' + (this.currentIterationIndex - 1)).css('background-color', '');
                    this.currentIterationNumber += 1;
                    this.currentIterationIndex = 1;
                    this.currentIteration = this.simulationResults[this.currentIterationNumber];
                    $('#iteration-cell-0').css('background-color', 'LightSteelBlue');
                    $('#iteration-cell-0').text(this.currentIteration[this.currentIterationIndex]);
                }
            }

            // Flag finished
            if (this.currentIterationNumber == (this.simulationResults.length - 1) && this.currentIterationIndex == (this.currentIteration.length - 1) ) {
                this.currentIterationNumber++;
            }
        }

        this.backwardIterationIndex = function() {
            if (this.currentIterationIndex > 0) {
                // If in the first iteration, set back to default, otherwise set to previous value
                if (this.currentIterationNumber == 0) {
                    this.currentIterationIndex--;
                    $('#iteration-cell-' + (this.currentIterationIndex)).css('background-color', '');
                    $('#iteration-cell-' + this.currentIterationIndex).text('-')
                    $('#iteration-cell-' + (this.currentIterationIndex - 1)).css('background-color', 'LightSteelBlue');
                } else if (this.currentIterationIndex == 1) { // Also need to wrap backwards if this is the case
                    $('#iteration-cell-0').css('background-color', '');
                    this.currentIterationNumber--;
                    this.currentIteration = this.simulationResults[this.currentIterationNumber];
                    $('#iteration-cell-0').text(this.currentIteration[0]);
                    this.currentIterationIndex = this.currentIteration.length;
                    $('#iteration-cell-' + (this.currentIterationIndex - 1)).css('background-color', 'LightSteelBlue')
                } else {
                    this.currentIterationIndex--;
                    $('#iteration-cell-' + (this.currentIterationIndex)).css('background-color', '');
                    $('#iteration-cell-' + this.currentIterationIndex).text(this.simulationResults[this.currentIterationNumber-1][this.currentIterationIndex]);
                    $('#iteration-cell-' + (this.currentIterationIndex - 1)).css('background-color', 'LightSteelBlue');
                }
            } else { // Need to wrap backwards
                // Can't wrap backwards if on first iteration
                if (this.currentIterationNumber != 0) {
                    this.currentIterationNumber--;
                    // Need to reset entire list of values to previous iteration
                    this.currentIteration = this.simulationResults[this.currentIterationNumber];
                    $('#iteration-cell-' + 0).text(this.currentIteration[0]);
                    $('#iteration-cell-' + this.currentIterationIndex).css('background-color', '');
                    this.currentIterationIndex = this.currentIteration.length;
                    $('#iteration-cell-' + (this.currentIterationIndex - 1)).css('background-color', 'LightSteelBlue');
                } else {
                    $('#iteration-cell-' + this.currentIterationIndex).text('-')
                    $('#iteration-cell-' + (this.currentIterationIndex)).css('background-color', '');
                }
            }
        }

        this.iterationTime = function() {
            return 5;
        }

        this.playIterations = function() {
            if (!this.configAnimPaused) {
                if (self.currentIterationNumber < self.simulationResults.length || self.currentIterationIndex < self.currentIteration.length) {
                    setTimeout(function() {
                        self.forwardIterationIndex();
                        self.playIterations();
                    }, self.iterationTime());
                } else { // Finished
                    $('#iteration-pause').addClass('disabled');
                    $('#iteration-play').removeClass('disabled');
                }
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
                    iteration.push(j);
                }
                results.push(iteration);
            }

            this.currentIteration = results[0];
            this.simulationResults = results;
            SimulationInterface.simulationResults = results;
        }

        this.newPolicy = function() {
            var currentConfig = SimulationInterface.configurationModule.currentConfig;
            var numNodes = currentConfig.nodes.length;
            var i;

            var currentCol = 0;
            var currentRow = 0;
            for (i = 0; i < numNodes; i++) {
                if (currentConfig.nodes[i].coords.Item2 > currentRow) {
                    currentCol = 0;
                    currentRow++;
                }
                var id = currentRow + "_" + currentCol;
                var num = Math.random();
                if (num <= 0.25) {
                    SimulationInterface.configurationModule.makeLeft(id);
                } else if (num <= 0.5) {
                    SimulationInterface.configurationModule.makeRight(id);
                } else if (num <= 0.75) {
                    SimulationInterface.configurationModule.makeTop(id);
                } else {
                    SimulationInterface.configurationModule.makeBottom(id);
                }
                currentCol++;
            }
            this.currentIterationIndex = 0;
            this.currentIterationNumber = 0;
            this.testResults();
        }
    }

    // Give the simulation interface an instance of the module
    SimulationInterface.availableModules.DynamicProgramming.toolbar = new DPToolbarModule();
})();