function setCytoscape(currentConfig) {
    buildElementStructure(currentConfig);

    // TODO: positions
    // find the center point and offset all the points so the center is at 0,0
    var cy = cytoscape({
        container: document.getElementById('cy'),
        style: [
            {
                selector: 'node',
                style: {
                    shape: 'ellipse',
                    'background-color': inactiveColor(),
                    label: 'data(id)'
                }
            }],
        layout: {
            name: 'preset'
        },
        elements: elements,
        zoom: 1,
        pan: { x: 0, y: 0 },
        minZoom: 1e-1,
        maxZoom: 1,
        wheelSensitivity: 0.2
    });

    cy.ready(function () {
        cy.nodes().positions(function (ele, i) {
            return {
                x: positionsArr[i].x,
                y: positionsArr[i].y
            }
        });
        // cy.nodes().lock()
    });

    cy.on('tap', 'node', function (evt) {
        var node = evt.target;
        console.log("tap", node.id(), node.position());
    });

    return cy
}

function buildElementStructure(currentConfig) {
    elements = [];
    positionsArr = [];

    for (var i = 0; i < currentConfig.nodes.length; i++) {
        // var x = (2) * (180 + currentConfig.nodes[i].x);
        // var y = (2) * (90 - currentConfig.nodes[i].y);
        elements.push({
            data: {
                id: currentConfig.nodes[i].id,
                position: {
                    x: currentConfig.nodes[i].x,
                    y: currentConfig.nodes[i].y
                }
            }
        })
        positionsArr.push({
            x: currentConfig.nodes[i].x,
            y: currentConfig.nodes[i].y
        })
    }

    for (var i = 0; i < currentConfig.edges.length; i++) {
        elements.push({
            data: {
                id: currentConfig.edges[i].id,
                source: currentConfig.edges[i].source,
                target: currentConfig.edges[i].target
            }
        })
    }
}

// possibleCytoscapeMaps is available to the current view so when the map is changed,
// the 'current' field needs to be false for all but the config that was just selected
function setConfigurationsInSelector(configs, possibleCytoscapeMaps) {
    var configSelector = $('#configuration-selector');
    for (var i = 0; i < configs.length; i++) {
        configSelector.append($('<option></option>').val(i).html("Configuration " + i));
    }
    configSelector.on('change', function () {
        currentConfig = configs[this.value];
        for (var i = 0; i < configs.length; i++) {
            if (i == this.value) { // Make sure this one is active, inactivate the rest
                possibleCytoscapeMaps[i]['map'] = setCytoscape(currentConfig);
                possibleCytoscapeMaps[i]['current'] = true;
            } else {
                possibleCytoscapeMaps[i]['current'] = false;
            }
        }
    })
}

function getCurrentMapObject(possibleCytoscapeMaps) {
    for(var i = 0; i < possibleCytoscapeMaps.length; i++) {
        if (possibleCytoscapeMaps[i]['current']) {
            return possibleCytoscapeMaps[i]['map'];
        }
    }
}

// simulationResults is a list of lists
// the inner list is a list of nodes to be animated at each frame
function assembleFullAnimation(simulationResults, cy, currentAnimation, frameToPauseOn) {
    
    debug = simulationResults.length

    var fullAnimation = new Array(debug);
    for (var i = 0; i < debug; i++) {
        fullAnimation[i] = assembleAnimationFrame(simulationResults[i], currentAnimation, cy, fullAnimation, frameToPauseOn);
    }
    currentAnimation['frames'] = fullAnimation;
    
    // console.log("fullAnimation")
    // console.log(fullAnimation) 
}

function assembleAnimationFrame(nodes, currentAnimation, cy, fullAnimation, frameToPauseOn) {
    var animationFrame = new Array(nodes.length);
    var lastInFrame = false;
    for(var i = 0; i < nodes.length; i++) {
        var elementToAnimate = cy.nodes()[nodes[i]]
        if (i == nodes.length - 1) {
            lastInFrame = true;
        }
        var nodeAnimation = assembleAnimation(elementToAnimate, currentAnimation, i, animationFrame, fullAnimation, frameToPauseOn);

        animationFrame[i] = nodeAnimation;
    }

    return animationFrame
}

function assembleAnimation(elementToAnimate, currentAnimation, currentIndex, thisFrame, fullAnimation, frameToPauseOn) {
        var lastInFrame = (currentIndex >= thisFrame.length - 1);
        var nodeAnimation = elementToAnimate.animation({
            style: {
                'background-color': activeColor()
            },
            duration: animationTime()
        });
        nodeAnimation['startColor'] = inactiveColor();
        nodeAnimation['element'] = elementToAnimate;

        connectAnimations(nodeAnimation, lastInFrame, thisFrame, currentIndex, fullAnimation, currentAnimation, frameToPauseOn)

    return nodeAnimation
}

function connectAnimations(nodeAnimation, lastInFrame, thisFrame, currentIndex, fullAnimation, currentAnimation, frameToPauseOn) {
    // Once the node has animated to its active color, kick off the animation for the next node
    nodeAnimation.promise('completed').then(function() {
        // console.log("black to red complete")

        // When the last animation in the frame finishes, play the reverse animation for the frame
        // i.e. go back to their original color.
        // When the last animation in this frame is back to its original, start the next frame
        if (lastInFrame) {
            // When moving forward or backward, the frame should auto-pause
            if (currentAnimation['timestep'] == frameToPauseOn || frameToPauseOn == -2) {
                return;
            }
            setTimeout( function() { // This timeout setups the amount of time the frame will pause when active
                if (!currentAnimation['paused']) {
                    for (var i = 0; i < thisFrame.length; i++) {
                        console.log("rewinding " + i + " in frame " + thisFrame.length)
                        thisFrame[i]['startColor'] = activeColor();
                        thisFrame[i].reverse()
                                    .rewind();
                        // Last in frame kicks off next frame
                        if (i >= thisFrame.length - 1) {
                            thisFrame[i].promise('completed').then(function() {
                                console.log("frame finishing...");
                                // console.log("finishing timestep: " + currentAnimation["timestep"])
                                currentAnimation["timestep"]++;
                                // console.log("starting timestep " + currentAnimation['timestep'])
                                if (currentAnimation["timestep"] < fullAnimation.length) {
                                    $('#frame-tracker').text(currentIndex + 2 + '/' + fullAnimation.length);
                                    fullAnimation[currentAnimation["timestep"]][0].play();
                                } else {
                                    currentAnimation["timestep"] = 0;
                                    currentAnimation["finished"] = true;
                                    $('#frame-tracker').text(0 + '/' + fullAnimation.length);
                                    $('#pause').addClass('disabled');
                                    $('#play').removeClass('disabled');
                                    $('#forward').removeClass('disabled');
                                    $('#backward').removeClass('disabled');                                    
                                }
                            });
                        }
                        thisFrame[i].play();
                    }
                }
            }, animationActiveTime())
            
        } else {
            var nextInFrame = null;
            if (!lastInFrame) {
                nextInFrame = thisFrame[currentIndex + 1];
            }
            nextInFrame.play();
        }
    });
}

function pauseFrame(frame) {
    console.log("pausing")
    for (var i = 0; i < frame.length; i++) {
        frame[i].pause();
    }
}

function playFrame(frameInfo) {
    if (frameInfo['timestep'] > frameInfo['numFrames'] || frameInfo['timestep'] < 0) {
        return
    }
    console.log("playing frame")
    console.log(frameInfo)
    $('#frame-tracker').text(frameInfo['timestep'] + 1 + '/' + frameInfo['numFrames']);
    frameInfo['frame'][0].play();
}

// This will reset all active elements back to inactive, then execute setFrameFunction
// which rebuilds the animations and starts at a specific frame
function resetFrame(frame, setFrameFunction, setFrameFunctionParameters) {
    console.log("resetting")
    console.log("frame in reset")
    console.log(frame)
    var resetAnim;
    for (var i = 0; i < frame.length; i++) {
        resetAnim = frame[i]['element'].animation({
            style: {
                'background-color': inactiveColor()
            },
            duration: resetTime()
        });
        resetAnim.play();
        if (i == frame.length - 1) {
            resetAnim.promise('completed').then(function() {
                setFrameFunction(setFrameFunctionParameters);
            });
        }
    }
}

function inactiveColor() {
    return 'black';
}

function activeColor() {
    return 'red';
}

// Time in ms it takes to reset after pausing
function resetTime() {
    return 500;
}

// Time in ms it takes for each animation in a frame to activate
function animationTime() {
    return 200;
}

// Time in ms nodes will stay active during a frame
function animationActiveTime() {
    return 1000;
}

function getDisplayedFrame() {
    return $('#frame-tracker').text().split("/")[0]
}