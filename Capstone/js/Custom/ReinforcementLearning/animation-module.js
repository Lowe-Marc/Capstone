(function() {

    function RLAnimationModule() {
        SimulationInterface.genericConstructors.animation.call(this);

        var self = this;
        this.currentPolicy = [];
        this.episodes = [];
        this.simulationResults = {};
        this.numEpisodes = 0;
        this.currentEpisodeNumber = 0;
        this.config = {};
        this.startNode = {};
        this.goalNode = {};

        this.configAnimPaused = false;
        this.learningPaused = false;

        this.TOP = function() {
            return 0;
        }

        this.BOTTOM = function() {
            return 1;
        }

        this.LEFT = function() {
            return 2;
        }

        this.RIGHT = function() {
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
            $('#frame-tracker').width((($('#frame-tracker').val().length + 2) * 8) + 'px');
        }

        this.setGamma = function(gamma) {
            $('#gamma-value').text(parseFloat(gamma).toFixed(2));
        }

        this.loadResults = function(results) {
            this.simulationResults = results;
            this.currentPolicy = [];
            this.config = this.simulationResults.config;
            var startID = this.config.nodes[this.config.startID].x + "_" + this.config.nodes[this.config.startID].y;
            var goalID = this.config.nodes[this.config.goalID].x + "_" + this.config.nodes[this.config.goalID].y;
            this.startNode = SimulationInterface.cy.$("#" + startID);
            this.goalNode = SimulationInterface.cy.$("#" + goalID);
            
            this.episodes = results.frames;
            this.numEpisodes = this.episodes.length;
            this.setMaxFrameCount(this.numEpisodes);
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

        this.displayNextEpisode = function() {
            if (this.currentEpisodeNumber < this.numEpisodes) {
                this.displayCurrentPolicy(this.currentEpisodeNumber);
                this.currentEpisodeNumber++;
                this.setCurrentFrame(this.currentEpisodeNumber);
            }
        }

        this.displayPreviousEpisode = function() {
            if (this.currentEpisodeNumber > 0) {
                this.currentEpisodeNumber--;
                this.displayCurrentPolicy(this.currentEpisodeNumber - 1);
                this.setCurrentFrame(this.currentEpisodeNumber);
            }
        }

        this.displayCurrentPolicy = function(episodeNumber) {
            var policy = self.episodes[episodeNumber].QLearning;
            var currentConfig = SimulationInterface.configurationModule.currentConfig;
            var i, policyLength = policy.length;
            var currentCol = 0;
            var currentRow = 0;
            var id, policyNum;

            for (i = 0; i < policyLength; i++) {
                if (currentConfig.nodes[i].coords.Item2 > currentRow) {
                    currentCol = 0;
                    currentRow++;
                }
                id = currentCol + "_" + currentRow;
                policyNum = policy[i];
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

        // Get node
        // Get action
        // Display action on node
        // Apply action to node to get new node
        // Repeat
        this.displayPolicy = function(episodeNumber) {
            this.removePolicyDisplay();
            setTimeout(function() {
                var policy = self.episodes[episodeNumber].QLearning;
                var action;
                var index = 0;
                var currentCell = self.startNode;
                console.log("start:", self.startNode)
                while (index < policy.length) {
                    action = policy[index];
                    self.displayAction(currentCell, action);
                    currentCell = self.applyAction(currentCell, action);
                    index++;
                }
            }, 100);
        }

        this.applyAction = function(cell, action) {
            var x = cell.id().split("_")[0]
            var y = cell.id().split("_")[1]
            var newX = parseInt(x);
            var newY = parseInt(y);
            var isInHole = (cell.data('cellType') == SimulationInterface.configurationModule.HOLE);
            // Falling in a hole will always return you to the startNode
            if (isInHole) 
                return this.startNode;
            
            switch (action) {
                case this.LEFT():
                    newX--;
                    break
                case this.RIGHT():
                    newX++;
                    break
                case this.TOP():
                    newY--;
                    break
                case this.BOTTOM():
                    newY++;
                    break
            }

            var newNode = SimulationInterface.cy.nodes('#' + newX + "_" + newY);
            var isWall = (cell.data('cellType') == SimulationInterface.configurationModule.WALL);

            return isWall ? cell : newNode
        }

        this.displayAction = function(cell, action) {
            var id = cell.id();
            if (action == self.LEFT()) {
                SimulationInterface.configurationModule.makeLeft(id);
            } else if (action == self.RIGHT()) {
                SimulationInterface.configurationModule.makeRight(id);
            } else if (action == self.TOP()) {
                SimulationInterface.configurationModule.makeTop(id);
            } else if (action == self.BOTTOM() ){
                SimulationInterface.configurationModule.makeBottom(id);
            }
        }

        this.removePolicyDisplay = function() {
            SimulationInterface.cy.nodes().each(function(element) {
                SimulationInterface.configurationModule.removeImage(element.id())
            })
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
            return 250;
        }

        // Automated learning is basically just advancing a policy, then playing its iterations
        // and repeating until the policy is finished
        this.automateLearning = function() {
            if (!self.learningPaused) {
                if (!self.atEndOfPolicy()) {
                    SimulationInterface.animationModule.displayNextEpisode();
                    SimulationInterface.animationModule.configAnimPaused = false;
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