(function() {

    function DPAnimationModule() {
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

        this.iterationTime = function() {
            return 10;
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

        this.disableAnimationControls = function() {
            $('#pause').addClass('disabled');
            $('#play').addClass('disabled');
            $('#iteration-pause').addClass('disabled');
            $('#iteration-play').addClass('disabled');
            $('#iteration-forward').addClass('disabled');
            $('#iteration-backward').addClass('disabled');
        }

        this.enableAnimationControls = function() {
            $('#pause').addClass('disabled');
            $('#play').removeClass('disabled');
            $('#iteration-pause').addClass('disabled');
            $('#iteration-play').removeClass('disabled');
            $('#iteration-forward').removeClass('disabled');
            $('#iteration-backward').removeClass('disabled');
        }

        /*
        Entry point for animation module
        */
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

        /*
        If first policy, just show the policy
        If not-first policy, make sure the old values have been iterated through before showing the new policy
        */
        this.forwardPolicy = function() {
            if (this.currentPolicyNumber < this.simulationResults.length) {
                self.configAnimPaused = false;
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

        /*
        If policy n is currently displayed, policy n - 1 is displayed.
        Also updates the values table to display the values for the final
        iteration of policy n - 2, which would be the values policy n - 1 would start with
        */
        this.backwardPolicy = function() {
            if (this.currentPolicyNumber > 0) {
                this.currentPolicyNumber--;
                this.setCurrentFrame(this.currentPolicyNumber);
                this.syncValues();
                if (this.currentPolicyNumber > 0) {
                    this.displayCurrentPolicy();
                }
            } else if (this.currentPolicyNumber == 0) {
                this.syncValues();
                this.setCurrentFrame(this.currentPolicyNumber);
            }
            console.log("policy:", this.currentPolicyNumber)
        }

        /*
        Intended to be called when searching to a specific policy or when moving backwards
        a policy. This will set the currently displayed values to the values of the last iteration
        for the policy prior to the newly displayed one.
        */
        this.syncValues = function() {
            if (this.currentPolicyNumber == 0) {
                this.displayEmptyValues();
                this.removePolicyDisplay();
            } else if (this.currentPolicyNumber == 1) {
                this.currentPolicyNumber--;
                this.displayEmptyValues();
                this.currentValues = this.simulationResults[this.currentPolicyNumber].values;
                this.deltasForCurrentValues = this.simulationResults[this.currentPolicyNumber].deltas;
                this.currentIterationNumber = 0;
                this.currentIteration = this.currentValues[this.currentIterationNumber];
                this.deltasForCurrentIteration = this.deltasForCurrentValues[this.currentPolicyNumber];
                this.currentIterationIndex = 0;
                this.configAnimPaused = false;
                this.displayCurrentPolicy();
            } else {
                this.disableAnimationControls();
                this.currentValues = this.simulationResults[this.currentPolicyNumber - 2].values;
                this.deltasForCurrentValues = this.simulationResults[this.currentPolicyNumber - 2].deltas;
                this.currentIterationNumber = this.currentValues.length - 1;
                this.currentIteration = this.currentValues[this.currentIterationNumber];
                this.deltasForCurrentIteration = this.deltasForCurrentValues[this.currentIterationNumber];
                this.currentIterationIndex = 0;
                this.configAnimPaused = false;
                console.log("currentIteration:", this.currentIterationNumber)
                console.log("deltas:", this.deltasForCurrentValues)
                this.playIterations(this.enableAnimationControls);
            }
        }

        /*
        Sets opacity of images to 0 to hide the policy
        */
        this.removePolicyDisplay = function(callbackFunction, functionParams) {
            var nodes = SimulationInterface.cy.nodes()
            nodes.each(function(element) {
                if (element.id() == nodes[nodes.length-1].id())
                    SimulationInterface.configurationModule.removeImage(element.id(), callbackFunction, functionParams)
                else
                    SimulationInterface.configurationModule.removeImage(element.id())
            })
        }

        /*
        Resets all values and removes all value highlighting
        */
        this.displayEmptyValues = function() {
            var currentConfig = SimulationInterface.configurationModule.currentConfig;
            var numNodes = currentConfig.nodes.length;
            var i = 0, currentRow = 0, currentCol = 0;
            for (i = 0; i < numNodes; i++) {
                $('#iteration-cell-' + i).css('background-color', '');
                
                if (currentConfig.nodes[i].coords.Item2 > currentRow) {
                    currentCol = 0;
                    currentRow++;
                }
                if (currentConfig.nodes[i].cellType == SimulationInterface.configurationModule.WALL)
                    $('#iteration-cell-' + i).text('-');
                else
                $('#iteration-cell-' + i).text('-0.00');
                currentCol++;
            }
        }

        /*
        Sets an image on every cy node that corresponds to the direction the policy
        has associated with that node.
        */
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

        /*
        Adjusts all relevant variables such that forwardIterationIndex
        can be called and the correct values will be displayed in the values table
        */
        this.updateValues = function() {
            this.currentValues = this.simulationResults[this.currentPolicyNumber].values;
            this.deltasForCurrentValues = this.simulationResults[this.currentPolicyNumber].deltas;
            $('#iteration-cell-' + (this.currentIterationIndex)).css('background-color', '');
            this.currentIterationIndex = 0;
            this.currentIterationNumber = 0;
            this.currentIteration = this.currentValues[0];
            this.deltasForCurrentIteration = this.deltasForCurrentValues[0];
        }

        /*
        Highlights the next value for the current iteration in the values table
        */
        this.forwardIterationIndex = function() {
            if (this.currentIterationIndex < this.currentIteration.length) {
                if (this.currentIterationIndex > 0) {
                    $('#iteration-cell-' + (this.currentIterationIndex - 1)).css('background-color', '');
                }
                $('#iteration-cell-' + this.currentIterationIndex).css('background-color', 'LightSteelBlue');
                $('#iteration-cell-' + this.currentIterationIndex).text(this.currentIterationCellText(this.currentIterationIndex));
                this.currentIterationIndex++;
            } else if (this.currentIterationNumber < (this.currentValues.length - 1)) { // Wrap to next iteration
                // Wrap to next iteration unless at final iteration
                if (this.currentIterationNumber < this.currentValues.length - 1) {
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

        /*
        Updates the delta-value text and returns the text in the currently highlighted cell of the values table
        */
        this.currentIterationCellText = function(index) {
            if (self.currentIteration[index] == self.WALLVALUE()) { // This is a wall
                return '-'
            } 
            $('#delta-value').text(parseFloat(self.deltasForCurrentIteration[index]).toFixed(2));
            return parseFloat(self.currentIteration[index]).toFixed(2);
        }

        /*
        Updates the delta-value text and returns the text in the previously highlighted cell of the values table
        */
        this.previousIterationCellText = function(index) {
            if (this.currentValues[this.currentIterationNumber-1][index] == this.WALLVALUE()) { // This is a wall
                return '-';
            }
            $('#delta-value').text(parseFloat(this.deltasForCurrentValues[this.currentIterationNumber-1][index]).toFixed(2));
            return parseFloat(this.currentValues[this.currentIterationNumber-1][index]).toFixed(2);
        }

        /*
        Prevents the next value in the values table from being highlighted
        */
        this.pauseIterations = function() {
            this.configAnimPaused = true;
            $('#iteration-pause').addClass('disabled');
            $('#iteration-play').removeClass('disabled');
            $('#iteration-forward').removeClass('disabled');
            $('#iteration-backward').removeClass('disabled');
        }

        /*
        Repeatedly update and highlight values in the value table until paused or all values for
        this policy have been displayed.

        This is not a particularly good way to do this as it assumes it will take iterationTime() in ms
        to update a value in the value table, which is simply changing text via jquery. Ideally this process
        would be event driven so that when a value is updated, the next value update is done without having to
        deal with time buffers. However, to my knowledge, this is not possible since there is currently no
        way to cause an html text update to fire an event in javascript.
        */
        this.playIterations = function(onFinished) {
            if (!self.configAnimPaused) {
                if (self.currentIterationNumber < self.currentValues.length || self.currentIterationIndex < self.currentIteration.length) {
                    setTimeout(function() {
                        self.forwardIterationIndex();
                        self.playIterations(onFinished);
                    }, self.iterationTime());
                }
            } else if(this.atEndOfCalculationRound()) {
                $('#complete-iteration-label').hide();
                if (onFinished != null) {
                    onFinished();
                }
            }
        }

        /*
        A calculation round is over if we have displayed every possible value calculated for a policy
        */
        this.atEndOfCalculationRound = function() {
            return (self.currentIterationNumber == (self.currentValues.length-1)) && (self.currentIterationIndex == self.currentIteration.length);
        }

        /*
        The amount of time that is expected to elapse to display all values for a policy.
        */
        self.learningTime = function() {
            return (self.iterationTime() + 2) * self.currentIteration.length;
        }

        /* 
        Automated learning is basically just advancing a policy, then displaying all calculatd value
        and repeating until all policies have been displayed, or it is paused
        */
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
    SimulationInterface.availableModules.DynamicProgramming.animation = new DPAnimationModule();
})();