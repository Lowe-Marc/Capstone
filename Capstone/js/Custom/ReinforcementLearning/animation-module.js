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
        this.learningPaused = true;

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

        this.AGENT_COLOR = function() {
            return 'DarkOliveGreen';
        }

        this.AGENT_ANIMATION_TIME = function() {
            return 1;
        }

        this.NO_AGENT_ANIMATION_TIME = function() {
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

        this.showAgent = function() {
            return $('#show-agent').is(":checked");
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
                if (self.showAgent()) {
                    this.displayAgentActions(this.currentEpisodeNumber);
                } else {
                    this.displayCurrentPolicy(this.currentEpisodeNumber);
                    this.currentEpisodeNumber++;
                    this.setCurrentFrame(this.currentEpisodeNumber);
                }
            }
        }

        this.displayPreviousEpisode = function() {
            if (this.currentEpisodeNumber > 0) {
                this.currentEpisodeNumber--;
                this.displayCurrentPolicy(this.currentEpisodeNumber - 1);
                this.setCurrentFrame(this.currentEpisodeNumber);
            }
        }

        // Start at start node
        // animate the agent color
        // apply action to current node, get next node
        // animate current node back to normal
        // animate next node to agent color
        // repeat
        this.displayAgentActions = function(episodeNumber) {
            self.states = self.episodes[episodeNumber].QLearningEpisodeStates;
            var currentAction = 0;
            var node = SimulationInterface.cy.nodes('#' + self.states[currentAction]);
            var anim;
            var color;

            color = node.data('background-color');
            anim = self.animateNodeToColor(node, self.AGENT_COLOR(), self.AGENT_ANIMATION_TIME());
            self.returnAnim = self.animateNodeToColor(node, color, self.AGENT_ANIMATION_TIME());

            self.returnAnim.promise('completed').then(function() {
                self.thisFunction = arguments.callee;
                currentAction += 1;
                node = node = SimulationInterface.cy.nodes('#' + self.states[currentAction]);
                color = node.data('background-color');
                anim = self.animateNodeToColor(node, self.AGENT_COLOR(), self.AGENT_ANIMATION_TIME());
                self.returnAnim = self.animateNodeToColor(node, color, self.AGENT_ANIMATION_TIME());
                if (currentAction < self.states.length) {
                    self.returnAnim.promise('completed').then(function() {
                        self.thisFunction();
                    })
                    anim.promise('completed').then(function() {
                        self.returnAnim.play();
                    })
                    anim.play();
                } else {
                    self.displayCurrentPolicy(self.currentEpisodeNumber);
                    self.currentEpisodeNumber++;
                    self.setCurrentFrame(self.currentEpisodeNumber);
                    if (!self.learningPaused) {
                        self.displayNextEpisode();
                    }
                }
            });
            anim.promise('completed').then(function() {
                self.returnAnim.play();
            });
            anim.play();
        }

        this.displayCurrentPolicy = function(episodeNumber) {
            var policy = self.episodes[episodeNumber].QLearningPolicy;
            var currentConfig = SimulationInterface.configurationModule.currentConfig;
            var i, policyLength = policy.length;
            var currentCol = 0;
            var currentRow = 0;
            var id, policyNum, anim;

            for (i = 0; i < policyLength; i++) {
                if (currentConfig.nodes[i].coords.Item2 > currentRow) {
                    currentCol = 0;
                    currentRow++;
                }
                id = currentCol + "_" + currentRow;
                policyNum = policy[i];
                if (policyNum > -1 && policyNum < 4) {
                    anim = SimulationInterface.configurationModule.makeDirection(id, policyNum, true)
                }
                currentCol++;
                // Don't automatically play the last anim, it may need a callback
                if (i < policyLength - 1 && anim != undefined)
                    anim.play();
            }

            if (!this.learningPaused && !this.showAgent()) {
                anim.promise('completed').then(function(){
                    setTimeout(function(){
                        self.displayNextEpisode();
                    }, self.NO_AGENT_ANIMATION_TIME())
                })
                // this.setAnimCallback(anim, this.displayNextEpisode);
                anim.play();
            }
        }

        // If the cell was not visited, the action will be -1 and will not display a direction
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