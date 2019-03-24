(function() {

    function AStarAnimationModule() {
        SimulationInterface.genericConstructors.animation.call(this);

        var self = this;
        this.animationIsPaused = true;

        this.simulationResults = {};
        this.currentFrameNumber = 0;
        this.numFrames = 0;
        this.animationFrames = [];
        this.frontierOverTime = [];
        this.currentFrame = [];
        this.currentAnimation = null;

        this.frameByFrame = false;

        this.ACTIVE = 1;

        this.ANIMATION_TIME = function() {
            return 200;
        }

        this.DEACTIVATE_TIME = function() {
            return 10;
        }

        this.ANIMATION_ACTIVE_TIME = function() {
            return 1000;
        }

        this.RESET_TIME = function() {
            return 500;
        }
    
        this.getDisplayedFrame = function() {
            return $('#frame-tracker').val()
        }
        
        this.setDisplayedFrame = function(frameCount) {
            $('#frame-tracker').val(frameCount)
            var numLength = (frameCount + '').length + 2;
            $('#frame-tracker').width(numLength * 8 + 'px');
        }
        
        this.setMaxFrameCountDisplay = function(frameCount) {
            $('#max-frame-count').text("/"+frameCount);
        }
        
        this.setCurrentFrameDisplay = function(frameNumber) {
            $('#frame-tracker').val(frameNumber);
            $('#frame-tracker').width((($('#frame-tracker').val().length + 2) * 8) + 'px');
        }

        this.syncCurrentFrameDisplay = function() {
            $('#frame-tracker').val(self.currentFrameNumber);
            $('#frame-tracker').width((($('#frame-tracker').val().length + 2) * 8) + 'px');
        }

        this.enablePlayControls = function() {
            $('#pause').addClass('disabled');
            $('#play').removeClass('disabled');
            $('#forward').removeClass('disabled');
            $('#backward').removeClass('disabled');
        }

        this.enablePauseControls = function() {
            $('#play').addClass('disabled');
            $('#pause').removeClass('disabled');
            $('#forward').addClass('disabled');
            $('#backward').addClass('disabled');
        }

        this.disableAllAnimationControls = function() {
            $('#play').addClass('disabled');
            $('#pause').addClass('disabled');
            $('#forward').addClass('disabled');
            $('#forward').addClass('disabled');
        }

        this.pause = function() {
            this.currentAnimation.pause();
            this.animationIsPaused = true;
            var frame = self.currentFrame;
            var node, i;
            for (i = 0; i < frame.length; i++) {
                node = SimulationInterface.cy.elements('node[simulationID=' + frame[i].id + ']');
                if (node.data('background-color') != SimulationInterface.configurationModule.nodeColor(self.ACTIVE)) {
                    self.anims[i].progress(0.99).apply().pause();
                } else {
                    self.anims[i].progress(0.0).apply().pause();
                }
            }
            SimulationInterface.animationModule.enablePlayControls();
        }

        this.play = function() {
            this.frameByFrame = false;
            this.animationIsPaused = false;
            if (self.currentFrameNumber >= self.numFrames) {
                return;
            }
            SimulationInterface.animationModule.enablePauseControls();
            if (self.currentAnimation != null && self.currentAnimation.progress() < 1) {
                self.currentAnimation.play();
            } else {
                self.displayNextFrame();
            }
        }

        this.seekToFrame = function(frameNumber) {
            this.currentFrameNumber = (frameNumber > 0) ? frameNumber - 1 : 0;
            self.animationIsPaused = true;
            self.frameByFrame = true;
            if (this.currentFrameNumber < this.numFrames) {
                if (self.frameByFrame && self.currentAnimation != null && self.currentAnimation.progress() == 0) {
                    self.currentAnimation.play();
                } else {
                    self.displayCurrentFrame();
                }
            }
        }

        this.loadResults = function(results) {
            this.simulationResults = results;
            this.animationFrames = results.frames;
            this.numFrames = this.animationFrames.length;
            this.frontierOverTime = results.simulationSpecific.frontierOverTime;
            this.setMaxFrameCountDisplay(this.numFrames);
        }

        this.displayNextFrame = function() {
            if (this.currentFrameNumber < this.numFrames) {
                this.displayCurrentFrame();
            } else {
                this.animationIsPaused = true;
                this.enablePlayControls();
            }
        }

        this.displayPreviousFrame = function() {
            if (this.currentFrameNumber > 0) {
                this.currentFrameNumber--;
                this.displayCurrentFrame();
            }
        }

        this.frameForward = function() {
            self.animationIsPaused = true;
            self.frameByFrame = true;
            if (this.currentFrameNumber < this.numFrames) {
                if (self.frameByFrame && self.currentAnimation != null && self.currentAnimation.progress() == 0) {
                    self.currentAnimation.play();
                } else {
                    self.displayCurrentFrame();
                }
            }
        }

        this.frameBackward = function() {
            self.animationIsPaused = true;
            self.frameByFrame = true;
            if (this.currentFrameNumber > 0) {
                // Decrementing by 1 would cause the same frame to be replayed, but don't make the frame number negative
                if (this.currentFrameNumber > 1) {
                    this.currentFrameNumber -= 2;
                } else {
                    if (this.currentFrameNumber == 1) {
                        self.animationIsPaused = true;
                        self.frameByFrame = false;
                        self.currentAnimation.promise('completed').then(function() {
                            self.syncCurrentFrameDisplay();
                            self.clearPriorityQueueDisplay();
                        });
                    }
                    this.currentFrameNumber -= 1;
                }
                if (self.currentAnimation != null) {
                    self.currentAnimation.play();
                } else {
                    self.displayCurrentFrame();
                }
            } else {
                if (self.frameByFrame && self.currentAnimation != null) {
                    self.animationIsPaused = true;
                    self.frameByFrame = false;
                    self.currentAnimation.play();
                } 
            }
        }

        /*
        Get the frame
        Create animation for each node to activate, on complete it should play the animation of the next node
        Create animation for each node to deactivate, on complete it should play the animation of the next node

        if the activation animation is the last node in the frame, kick off deactivation
        if the deactivation animation is the last node ion the frame, kick off next frame, if not paused
        
        Update self.currentAnimation to point at the currently playing animation
        At any point, if the animation is paused, call pause on the current animation
        */
        this.displayCurrentFrame = function() {
            self.updatePriorityQueueDisplay();
            
            self.currentFrame = self.animationFrames[self.currentFrameNumber].frame;
            var frame = self.currentFrame;
            var originalColors = [];

            var currentFrameIndex = 0;
            var node = SimulationInterface.cy.elements('node[simulationID=' + frame[currentFrameIndex].id + ']');
            originalColors[currentFrameIndex] = node.data('background-color');
            currentFrameIndex++;
            self.anims = [null, null];
            self.animIndex = 0;
            self.anims[self.animIndex] = self.animateNodeToColor(node, SimulationInterface.configurationModule.nodeColor(self.ACTIVE), self.ANIMATION_TIME());
            self.currentAnimation = null;
            var activating = true;
            self.anims[self.animIndex].promise('completed').then(function() {
                self.thisFunction = arguments.callee;
                self.animIndex = currentFrameIndex// % 2;
                if (currentFrameIndex == frame.length && activating)
                    activating = false;
                
                if (currentFrameIndex < frame.length && activating) { // Activating a path of nodes
                    node = SimulationInterface.cy.elements('node[simulationID=' + frame[currentFrameIndex].id + ']');
                    originalColors[currentFrameIndex] = node.data('background-color');
                    self.anims[self.animIndex] = self.animateNodeToColor(node, SimulationInterface.configurationModule.nodeColor(self.ACTIVE), self.ANIMATION_TIME());
                    self.anims[self.animIndex].promise('completed').then(function() {
                        currentFrameIndex++;
                        self.thisFunction();
                    });
                    self.currentAnimation = self.anims[self.animIndex];
                    self.anims[self.animIndex].play();
                } else if (currentFrameIndex > 0 && !activating) { // Deactivating a path of nodes
                    currentFrameIndex--;
                    node = SimulationInterface.cy.elements('node[simulationID=' + frame[currentFrameIndex].id + ']');
                    self.anims[self.animIndex] = self.animateNodeToColor(node, originalColors[currentFrameIndex], self.DEACTIVATE_TIME());
                    self.anims[self.animIndex].promise('completed').then(function() {
                        self.thisFunction();
                    });
                    self.currentAnimation = self.anims[self.animIndex];
                    // self.frameByFrame should prevent only the first deactivation, since promises will kick off all the rest
                    if (currentFrameIndex == frame.length - 1) {
                        self.currentFrameNumber++;
                        self.syncCurrentFrameDisplay();
                        if (!self.frameByFrame && !self.animationIsPaused && self.currentFrameNumber < self.numFrames) {
                            setTimeout(function() {
                                // Repeating this condition because if pause is pressed after the timeout has started,
                                // the animation should not play
                                if (!self.animationIsPaused) {
                                    self.anims[self.animIndex].play()
                                }
                            }, self.ANIMATION_ACTIVE_TIME());
                        } else {
                            self.enablePlayControls();
                        }
                    } else 
                        self.anims[self.animIndex].play();
                } else if (currentFrameIndex == 0 && !activating) { // Frame finished
                    if (!self.animationIsPaused || self.frameByFrame) {
                        self.displayNextFrame();
                    } else {
                        self.enablePlayControls();
                    }
                }
            });

            self.anims[self.animIndex].play();
        }

        this.updatePriorityQueueDisplay = function() {
            var content = '';
            var priorityQueue = self.frontierOverTime[self.currentFrameNumber];
            var queueLength = priorityQueue.length;
            var displayLimit = 10;
            queueLength = priorityQueue.length > displayLimit ? displayLimit : priorityQueue.length;
            for (var i = 0; i < queueLength; i++) {
                content += priorityQueue[i].name.replace('_', ' ') + ': ' + priorityQueue[i].f + '<br>';
            }
            if (queueLength == displayLimit) {
                content += '...<br>'
            }
            
            $('#priority-queue-div').html(content);
        }

        this.clearPriorityQueueDisplay = function() {
            $('#priority-queue-div').html('');
        }

        this.removePolicyDisplay = function(callbackFunction, functionParams) {
            var nodes = SimulationInterface.cy.nodes()
            nodes.each(function(element) {
                if (element.id() == nodes[nodes.length-1].id())
                    SimulationInterface.configurationModule.removeImage(element.id(), callbackFunction, functionParams)
                else
                    SimulationInterface.configurationModule.removeImage(element.id())
            })
        }

    }

    // Give the simulation interface an instance of the module
    SimulationInterface.availableModules.AStar.animation = new AStarAnimationModule();
})();