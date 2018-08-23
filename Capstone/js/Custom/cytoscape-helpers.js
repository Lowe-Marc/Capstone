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
                    'background-color': 'black',
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
function assembleFullAnimation(simulationResults, cy, animationFrames, currentTimestep) {
    
    debug = simulationResults.length

    var fullAnimation = new Array(debug);
    for (var i = 0; i < debug; i++) {
        fullAnimation[i] = assembleAnimationFrame(simulationResults[i], currentTimestep, cy, fullAnimation);
    }
    
    console.log("fullAnimation")
    console.log(fullAnimation)
    
    fullAnimation[0][0].play();
}

function assembleAnimationFrame(nodes, currentTimestep, cy, fullAnimation) {
    // console.log("nodes")
    // console.log(nodes)

    var animationFrame = new Array(nodes.length);
    var lastInFrame = false;
    for(var i = 0; i < nodes.length; i++) {
        var elementToAnimate = cy.nodes()[nodes[i]]
        if (i == nodes.length - 1) {
            lastInFrame = true;
        }
        var nodeAnimation = assembleAnimation(elementToAnimate, currentTimestep, i, animationFrame, fullAnimation);

        animationFrame[i] = nodeAnimation;
    }

    return animationFrame
}

function assembleAnimation(elementToAnimate, currentTimestep, currentIndex, thisFrame, fullAnimation) {
    
        var lastInFrame = (currentIndex >= thisFrame.length - 1);
        var nodeAnimation = elementToAnimate.animation({
            style: {
                'background-color': 'red'
            },
            duration: 500
        });

        connectAnimations(nodeAnimation, lastInFrame, thisFrame, currentIndex, fullAnimation, currentTimestep)

    return nodeAnimation
}

function connectAnimations(nodeAnimation, lastInFrame, thisFrame, currentIndex, fullAnimation, currentTimestep) {
    // Once the node has animated to its active color, kick off the animation for the next node
    nodeAnimation.promise('completed').then(function() {
        console.log("black to red complete")

        // When the last animation in the frame finishes, play the reverse animation for the frame
        // i.e. go back to their original color.
        // When the last animation in this frame is back to its original, start the next frame
        if (lastInFrame) {
            for (var i = 0; i < thisFrame.length; i++) {
                console.log("rewinding " + i + " in frame " + thisFrame.length)
                thisFrame[i].reverse()
                            .rewind();
                // Last in frame kicks off next frame
                if (i >= thisFrame.length - 1) {
                    thisFrame[i].promise('completed').then(function() {
                        console.log("frame finishing...");
                        console.log("finishing timestep: " + currentTimestep["timestep"])
                        currentTimestep["timestep"]++; //TODO: This isn't actually incrementing the value
                        console.log("starting timestep " + currentTimestep)
                        if (currentTimestep["timestep"] < fullAnimation.length) {
                            fullAnimation[currentTimestep["timestep"]][0].play();
                        } else {
                            currentTimestep["timestep"] = 0;
                        }
                    });
                }
                thisFrame[i].play();
            }
        } else {
            var nextInFrame = null;
            if (!lastInFrame) {
                nextInFrame = thisFrame[currentIndex + 1];
                console.log("playing next in frame")                
            }
            nextInFrame.play();
        }
    });
}