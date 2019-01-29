(function() {

    function RLAnimationModule() {
        SimulationInterface.genericConstructors.animation.call(this);

        var self = this;
        this.currentIterationIndex = 0;
        this.currentIterationNumber = 0;
        this.currentPolicyNumber = 0;
        this.currentIteration = [];
        this.deltasForCurrentIteration = [];
        this.currentValues = [];
        this.deltasForCurrentValues = [];
        this.currentPolicy = [];
        this.simulationResults = {};

        this.configAnimPaused = false;
        this.learningPaused = false;

        this.LEFT = function() {
            return 0;
        }

        this.RIGHT = function() {
            return 1;
        }

        this.TOP = function() {
            return 2;
        }

        this.BOTTOM = function() {
            return 3;
        }

        this.WALLVALUE = function() {
            return 100;
        }

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
        
        this.setCurrentFrame = function(frameNumber) {
            $('#frame-tracker').val(frameNumber);
        }

        this.setTheta = function(theta) {
            $('#theta-value').text(parseFloat(theta).toFixed(2));
        }

        this.setGamma = function(gamma) {
            $('#gamma-value').text(parseFloat(gamma).toFixed(2));
        }

        this.loadResults = function(results) {
            this.currentIterationIndex = 0;
            this.currentIterationNumber = 0;
            this.currentPolicyNumber = 0;
            this.currentIteration = [];
            this.deltasForCurrentIteration = [];
            this.currentValues = [];
            this.deltasForCurrentValues = [];
            this.currentPolicy = [];

            this.simulationResults = results.frames;
            this.setMaxFrameCount(this.simulationResults.length);
            this.setTheta(SimulationInterface.simulationResults.simulationSpecific.theta);
            this.setCurrentFrame(0);
        }

        this.forwardPolicy = function() {
            if (this.currentPolicyNumber < this.simulationResults.length) {
                self.configAnimPaused = false;
                // If first policy, just show the policy
                // If not-first policy, make sure the old values have been iterated through before showing the new policy
                if ( (this.currentPolicyNumber == 0) || this.atEndOfCalculationRound()) {
                    this.updateValues();
                    this.displayCurrentPolicy();
                } else {
                    $('#complete-iteration-label').show();
                    return;
                }
                this.currentPolicyNumber += 1;
                this.setCurrentFrame(this.currentPolicyNumber);
            }
        }

        this.backwardPolicy = function() {
            if (this.currentPolicyNumber > 1) {
                this.currentPolicyNumber -= 1;
                this.displayCurrentPolicy();
                this.updateValues();
                this.setCurrentFrame(this.currentPolicyNumber);
                this.playIterations();
            }
        }

        this.displayCurrentPolicy = function() {
            self.currentPolicy = self.simulationResults[self.currentPolicyNumber].policy;
            var currentConfig = SimulationInterface.configurationModule.currentConfig;
            var i, policyLength = self.currentPolicy.length;
            var currentCol = 0;
            var currentRow = 0;
            var id, policyNum;

            for (i = 0; i < policyLength; i++) {
                if (currentConfig.nodes[i].coords.Item2 > currentRow) {
                    currentCol = 0;
                    currentRow++;
                }
                id = currentCol + "_" + currentRow;
                policyNum = self.currentPolicy[i];
                if (policyNum == self.LEFT()) {
                    SimulationInterface.configurationModule.makeLeft(id);
                } else if (policyNum == self.RIGHT()) {
                    SimulationInterface.configurationModule.makeRight(id);
                } else if (policyNum == self.TOP()) {
                    SimulationInterface.configurationModule.makeTop(id);
                } else if (policyNum == self.BOTTOM() ){
                    SimulationInterface.configurationModule.makeBottom(id);
                }
                currentCol++;
            }
        }

        this.updateValues = function() {
            this.currentValues = this.simulationResults[this.currentPolicyNumber].values;
            this.deltasForCurrentValues = this.simulationResults[this.currentPolicyNumber].deltas;
            $('#iteration-cell-' + (this.currentIterationIndex)).css('background-color', '');
            this.currentIterationIndex = 0;
            this.currentIterationNumber = 0;
            this.currentIteration = this.currentValues[0];
            this.deltasForCurrentIteration = this.deltasForCurrentValues[0];
        }

        this.forwardIterationIndex = function() {
            if (this.currentIterationIndex < this.currentIteration.length) {
                if (this.currentIterationIndex > 0) {
                    $('#iteration-cell-' + (this.currentIterationIndex - 1)).css('background-color', '');
                }
                $('#iteration-cell-' + this.currentIterationIndex).css('background-color', 'LightSteelBlue');
                $('#iteration-cell-' + this.currentIterationIndex).text(this.currentIterationCellText(this.currentIterationIndex));
                this.currentIterationIndex++;
            } else if (this.currentIterationNumber < (this.currentValues.length - 1)) { // Wrap to next iteration
                // Can't wrap if at final value
                if (this.currentIterationNumber != this.currentValues.length - 1) {
                    $('#iteration-cell-' + (this.currentIterationIndex - 1)).css('background-color', '');
                    this.currentIterationNumber += 1;
                    this.currentIterationIndex = 1;
                    this.currentIteration = this.currentValues[this.currentIterationNumber];
                    this.deltasForCurrentIteration = this.deltasForCurrentValues[this.currentIterationNumber];
                    $('#iteration-cell-0').css('background-color', 'LightSteelBlue');
                    $('#iteration-cell-0').text(this.currentIterationCellText(this.currentIterationIndex));
                }
            } else {
                this.pauseIterations();
            }
        }

        this.backwardIterationIndex = function() {
            if (this.currentIterationIndex > 0) {
                // If in the first iteration, set back to default, otherwise set to previous value
                if (this.currentIterationNumber == 0) {
                    this.currentIterationIndex--;
                    $('#iteration-cell-' + (this.currentIterationIndex)).css('background-color', '');
                    $('#iteration-cell-' + this.currentIterationIndex).text('-');
                    $('#iteration-cell-' + (this.currentIterationIndex - 1)).css('background-color', 'LightSteelBlue');
                } else if (this.currentIterationIndex == 1) { // Also need to wrap backwards if this is the case
                    $('#iteration-cell-0').css('background-color', '');
                    this.currentIterationNumber--;
                    this.currentIteration = this.currentValues[this.currentIterationNumber];
                    this.deltasForCurrentIteration = this.deltasForCurrentValues[this.currentIterationNumber];
                    $('#iteration-cell-0').text(this.currentIteration[0]);
                    this.currentIterationIndex = this.currentIteration.length;
                    $('#iteration-cell-' + (this.currentIterationIndex - 1)).css('background-color', 'LightSteelBlue');
                } else {
                    this.currentIterationIndex--;
                    $('#iteration-cell-' + (this.currentIterationIndex)).css('background-color', '');
                    $('#iteration-cell-' + this.currentIterationIndex).text(this.previousIterationCellText(this.currentIterationIndex));
                    $('#iteration-cell-' + (this.currentIterationIndex - 1)).css('background-color', 'LightSteelBlue');
                }
            } else { // Need to wrap backwards
                // Can't wrap backwards if on first iteration
                if (this.currentIterationNumber != 0) {
                    this.currentIterationNumber--;
                    // Need to reset entire list of values to previous iteration
                    this.currentIteration = this.currentValues[this.currentIterationNumber];
                    this.deltasForCurrentIteration = this.deltasForCurrentValues[this.currentIterationNumber];
                    $('#iteration-cell-' + 0).text(this.currentIteration[0]);
                    $('#iteration-cell-' + this.currentIterationIndex).css('background-color', '');
                    this.currentIterationIndex = this.currentIteration.length;
                    $('#iteration-cell-' + (this.currentIterationIndex - 1)).css('background-color', 'LightSteelBlue');
                } else {
                    $('#iteration-cell-' + this.currentIterationIndex).text('-');
                    $('#iteration-cell-' + (this.currentIterationIndex)).css('background-color', '');
                }
            }
        }

        this.currentIterationCellText = function(index) {
            if (this.currentIteration[index] == this.WALLVALUE()) { // This is a wall
                return '-'
            } 
            $('#delta-value').text(parseFloat(this.deltasForCurrentIteration[index]).toFixed(2));
            return parseFloat(this.currentIteration[index]).toFixed(2);
        }

        this.previousIterationCellText = function(index) {
            if (this.currentValues[this.currentIterationNumber-1][index] == this.WALLVALUE()) { // This is a wall
                return '-';
            }
            $('#delta-value').text(parseFloat(this.deltasForCurrentValues[this.currentIterationNumber-1][index]).toFixed(2));
            return parseFloat(this.currentValues[this.currentIterationNumber-1][index]).toFixed(2);
        }

        this.iterationTime = function() {
            return 10;
        }

        this.pauseIterations = function() {
            this.configAnimPaused = true;
            $('#iteration-pause').addClass('disabled');
            $('#iteration-play').removeClass('disabled');
        }

        this.playIterations = function(onFinished) {
            if (!self.configAnimPaused) {
                if (self.currentIterationNumber < self.currentValues.length || self.currentIterationIndex < self.currentIteration.length) {
                    setTimeout(function() {
                        self.forwardIterationIndex();
                        self.playIterations(onFinished);
                    }, self.iterationTime());
                }
            } else if(this.atEndOfCalculationRound()) { // Finished iterating
                $('#complete-iteration-label').hide();
                if (onFinished != null) {
                    onFinished();
                }
            }
        }

        this.atEndOfCalculationRound = function() {
            return (self.currentIterationNumber == (self.currentValues.length-1)) && (self.currentIterationIndex == self.currentIteration.length);
        }

        self.learningTime = function() {
            return (self.iterationTime() + 2) * self.currentIteration.length;
        }

        // Automated learning is basically just advancing a policy, then playing its iterations
        // and repeating until the policy is finished
        this.automateLearning = function() {
            if (!self.learningPaused) {
                if (!self.atEndOfPolicy()) {
                    SimulationInterface.animationModule.forwardPolicy();
                    SimulationInterface.animationModule.configAnimPaused = false;
                    SimulationInterface.animationModule.playIterations();
                    setTimeout(function() {
                        self.automateLearning();
                    }, self.learningTime())
                } else {
                    $('#pause').addClass('disabled');
                    $('#play').removeClass('disabled');
                }
            }
        }

        this.atEndOfPolicy = function() {
            return (this.getDisplayedFrame() == this.simulationResults.length);
        }
    }

    // Give the simulation interface an instance of the module
    SimulationInterface.availableModules.ReinforcementLearning.animation = new RLAnimationModule();
})();