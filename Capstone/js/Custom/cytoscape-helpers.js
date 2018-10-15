var cy;
var configs;
var currentConfig;


// Constants
function inactiveColor() {
    return 'black';
}

function activeColor() {
    return 'blue';
}

function errorColor() {
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

function setDisplayedFrame(frameCount) {
    $('#frame-tracker').text("0/"+frameCount)
}

function DONTPAUSE() {
    return -1;
}

function toggleFullscreen() {
    var section = document.getElementById('simulation-area');
    if (section.requestFullscreen) {
        section.requestFullscreen();
    } else if (section.mozRequestFullScreen) { /* Firefox */
        section.mozRequestFullScreen();
    } else if (section.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
        section.webkitRequestFullscreen();
    } else if (section.msRequestFullscreen) { /* IE/Edge */
        section.msRequestFullscreen();
    }
    $('#fullscreen-enter').hide();
    $('#fullscreen-exit').show();
}

function closeFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE/Edge */
      document.msExitFullscreen();
    }
    $('#fullscreen-enter').show();
    $('#fullscreen-exit').hide();
    configurationOverlayOff();
}

// Simple helpers to disable/enable buttons
function disablePlay() {
    $('#play').addClass('disabled');
    $('#forward').addClass('disabled');
    $('#backward').addClass('disabled');
}

function disablePause() {
    $('#pause').addClass('disabled');
}

function disablePlayAndPause() {
    disablePlay();
    disablePause();
}

function enablePlay() {
    $('#play').removeClass('disabled');
    $('#forward').removeClass('disabled');
    $('#backward').removeClass('disabled');
}

function enablePause() {
    $('#pause').removeClass('disabled');
}

function enablePlayAndPause() {
    enablePlay();
    enablePause();
}

function canPlay() {
    return !$('#play').hasClass('disabled')
}

function lockNodes() {
    cy.nodes().lock();
    $('#lock-locked').show();
    $('#lock-unlocked').hide();
}

function unlockNodes() {
    cy.nodes().unlock();    
    $('#lock-locked').hide();
    $('#lock-unlocked').show();
}

// Renders the CY map and handles node specific properties such as clicking and locking
function setCytoscape(currentConfig) {
    buildElementStructure(currentConfig);

    // TODO: positions
    // find the center point and offset all the points so the center is at 0,0
    cy = cytoscape({
        container: document.getElementById('cy'),
        style: [
            {
                selector: 'node',
                style: {
                    shape: 'ellipse',
                    'background-color': inactiveColor(),
                    label: 'data(label)'
                }
            },
            {
                selector: 'edge',
                style: {
                    label: 'data(label)',
                    'edge-text-rotation': 'autorotate'
                },
            }
        ],
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
        lockNodes();
    });

    cy.nodes().each(function (node) {
        cy.$('#' + node.id()).qtip({
            content: {
                text: function(event, api) {
                    console.log("clicking")
                    var connecting; 
                    if ($('#add-connection-modal').is(':visible')) {
                        console.log("adding connection")
                        connecting = true;
                    }
                    return qtipContent(node, connecting);
                }
            },
            position: {
                my: 'top center',
                at: 'bottom center'
            },
            style: {
                classes: 'qtip-bootstrap',
                // tip: {
                //     width: 16,
                //     height: 8
                // }
            }
        });
    });

    return cy
}

function qtipContent(node, connecting) {
    var content;
    if (connecting) {
        return "<button id='confirm-connection' class='btn' onclick='confirmConnection(\"" +  node.data('label').replace(' ','_').split(':')[0] + "\")'>Connect to this node</button>"
    }
    // Start and end buttons
    // Add node and connection buttons
    content  = "<div id='operation' class='qtip-sub-div'>"
    content += "<div class='svg-expand pointer second'>"
    content += "<span class='fa oi icon' id='home' data-glyph='home' title='Start Here' aria-hidden='true' onclick=makeStartNode(\"" + node.data('label').replace(' ','_').split(':')[0] + "\",\"" + node.data('simulationID') + "\")></span>"
    content += "<span class='fa oi icon' id='map-marker' data-glyph='map-marker' title='End Here' aria-hidden='true' onclick=makeGoalNode(\"" + node.data('label').replace(' ','_').split(':')[0] + "\",\"" + node.data('simulationID') + "\")></span>"
    content += "<span class='fa oi icon' data-toggle='modal' id='plus' data-glyph='plus' title='Add a new node' aria-hidden='true' onclick=promptAddNode(\"" + node.data('label').replace(' ','_').split(':')[0] + "\")></span>"
    content += "<span class='fa oi icon' data-toggle='modal' id='transfer' data-glyph='transfer' title='Add a new connection' aria-hidden='true' onclick=promptAddConnection(\"" + node.data('label').replace(' ','_').split(':')[0] + "\")></span>"
    content += "</div>";
    content += "</div>";

    content += "<br>";

    content += "<div class='qtip-sub-div' id='heuristic-div'>";
    content += "<div id='heuristic-input-div'>"
    content += "<label id='heuristic-label'>Heuristic:</label>"
    content += "<input id='heuristic-value-" + node.id() + "' class='heuristic-input' type='number' min='0' step='1' value='" + node.data('heuristic') + "' onkeyup='if (value < 0){ value = 0 }'></input>"
    content += "<div style='padding:2px'></div>"
    content += "<button id='heuristic-update-button' style='width: 100%' class='btn' onclick='checkHeuristic(\"" + node.data('label').replace(' ','_') + "\",\"" + node.data('simulationID') + "\")'>Update</button>"
    content += "</div>"
    content += "</div>"
    return content;
}

function promptAddNode(nodeToConnect) {
    console.log("nodeToConnect", nodeToConnect)
    $('#myModal').show();
    $('#myModal').children().show();
    $('#node-connection-name').val(nodeToConnect.replace('_', ' '));
}

function addNode() {
    var nodeToConnect = $('#node-connection-name').val().replace(' ', '_');
    var name = $('#node-name').val().replace(' ', '_');
    var distance = $('#node-distance').val();
    currentConfig.nodes.push({
        id: name,
        x: 0,
        y: 0
    });

    currentConfig.edges.push({
        source: nodeToConnect,
        target: name,
        distance: distance,
    });
    setCytoscape(currentConfig);
    $('#myModal').hide();
    console.log("adding node", currentConfig)
}

// TODO: disable other buttons
function promptAddConnection(nodeToConnect) {
    $('#add-connection-modal').show();
    $('#add-connection-modal').children().show();
    $('#connection-header').text(nodeToConnect.replace('_', ' '))
}

function confirmConnection(nodeOne) {
    var nodeTwo = $('#connection-header').text()
    addConnection(nodeOne, nodeTwo);
    $('#add-connection-modal').hide();
}

function addConnection(nodeOne, nodeTwo) {
    nodeOne = nodeOne.split(':')[0];
    nodeTwo = nodeTwo.split(':')[0];
    console.log("nodeOne - nodeTwo: ", nodeOne, nodeTwo)
    console.log("configs again", configs)
    console.log("currentConfig:", currentConfig)
    currentConfig.edges.push({
        source: nodeOne,
        target: nodeTwo,
        distance: 5,
    });
    setCytoscape(currentConfig);
}

function makeStartNode(id, simulationID) {
    $('#start-label').text(id.replace('_', ' '));
    $('#start-id').text(simulationID);
}

// Needs to set the label, set the goal node heuristic to 0 and make the heuristic calculations
function makeGoalNode(id, simulationID) {
    $('#goal-label').text(id.replace('_', ' '));
    $('#goal-id').text(simulationID);

    $('#heuristic-value-' + id).val(0)
    cy.$('#' + id).data('heuristic', 0);
    calculateDistances(id, simulationID);
    setHeuristics();
}

function setHeuristics() {
    cy.nodes().each(function(node) {
        console.log(node)
        node.data('label', node.id().replace('_', ' ') + ": " + node.data('heuristic'));
    });
}

function checkHeuristic(id, simulationID) {
    id = id.split(":")[0].replace(' ', '_');
    var node = cy.$('#' + id);
    node.data('id', id)
    var heuristic = parseInt($('#heuristic-value-' + id).val());
    if (heuristic < 0 || !Number.isInteger(heuristic)) {
        $('#heuristic-value-' + id).addClass('has-error');
        return;
    }
    $('#heuristic-value-' + id).val(heuristic);
    $('#heuristic-value-' + id).removeClass('has-error');
    node.data('heuristic', heuristic);
    node.data('label', node.id().replace('_', ' ') + ": " + heuristic);
    console.log("heuristic", heuristic)
    console.log("distanceToGoal", node.data('distanceToGoal'))
    console.log(node.data('distanceToGoal'))
    if (heuristic > node.data('distanceToGoal')) {
        console.log("greater than")
        var nodeAnimation = node.animation({
            style: {
                'background-color': errorColor()
            },
            duration: animationTime()
        });
        nodeAnimation.play();
    } else {
        console.log("less than")
        var nodeAnimation = node.animation({
            style: {
                'background-color': inactiveColor()
            },
            duration: animationTime()
        });
        nodeAnimation.play();
    }
}

// TODO: If running into performance concerns, this calculation could probably be moved
function calculateDistances(id, simulationID) {
    var dijkstra
    console.log("nodes")
    for (var i = 0; i < cy.nodes()['length']; i++) {
        dijkstra = cy.elements().dijkstra('#' + cy.nodes()[i].id(), function(edge) {
            return edge.data('distance');
        })
        cy.nodes()[i].data('distanceToGoal', dijkstra.distanceTo(cy.$('#' + id)))
    }
}

// Assembles the object used to render the CY map
function buildElementStructure(currentConfig) {
    elements = [];
    positionsArr = [];

    var nodeMap = {};
    var label;
    for (var i = 0; i < currentConfig.nodes.length; i++) {
        // var x = (2) * (180 + currentConfig.nodes[i].x);
        // var y = (2) * (90 - currentConfig.nodes[i].y);
        heuristic = 1;
        elements.push({
            data: {
                id: currentConfig.nodes[i].id.replace(' ', '_'),
                elementType: "node",
                simulationID: i,
                label: currentConfig.nodes[i].id,
                distanceToGoal: -1,
                heuristic: heuristic,
                position: {
                    x: currentConfig.nodes[i].x,
                    y: currentConfig.nodes[i].y
                }
            }
        })
        nodeMap[currentConfig.nodes[i].id.replace(' ', '_')] = i;
        positionsArr.push({
            x: currentConfig.nodes[i].x,
            y: currentConfig.nodes[i].y
        })
    }

    var heuristic = 1;
    var actualDistance = 1.0;
    label = "g: " + actualDistance;
    for (var i = 0; i < currentConfig.edges.length; i++) {
        elements.push({
            data: {
                id: currentConfig.edges[i].id,
                elementType: "edge",
                simulationID: i,
                distance: actualDistance,
                label: label,
                source: currentConfig.edges[i].source.replace(' ','_'),
                target: currentConfig.edges[i].target.replace(' ','_'),
                sourceID: nodeMap[currentConfig.edges[i].source.replace(' ','_')],
                targetID: nodeMap[currentConfig.edges[i].target.replace(' ','_')]
            }
        })
    }
}

// possibleCytoscapeMaps is available to the current view so when the map is changed,
// the 'current' field needs to be false for all but the config that was just selected
function setConfigurationsInSelector(configs, possibleCytoscapeMaps) {
    var configSelector = $('#configuration-selector');
    configSelector.empty();
    collectCookieConfigurations()
    console.log("in select")
    for (var i = 0; i < configs.length; i++) {
        console.log(configs[i])
        configSelector.append($('<option></option>').val(i).html(configs[i].name));
        if (i > possibleCytoscapeMaps.length) {
            possibleCytoscapeMaps.push({
                map: null,
                current: false
            })
        }
    }
    console.log("configs in select")
    console.log(configs)
    currentConfig = configs[0];
    configSelector.on('change', function () {
        currentConfig = configs[this.value];
        for (var i = 0; i < configs.length; i++) {
            if (i == this.value) { // Make sure this one is active, inactivate the rest
                possibleCytoscapeMaps[i]['map'] = setCytoscape(currentConfig);
                possibleCytoscapeMaps[i]['current'] = true;
            }
        }
    })
}

function collectCookieConfigurations() {
    // console.log("cookies")
    var cookies = document.cookie.split("; ")
    // console.log(cookies)
    if (cookies[0] == "" && cookies.length == 1) 
        return;
    var nameConfigPair;
    var newConfig;
    for (var i = 0; i < cookies.length; i++) {
        nameConfigPair = cookies[i].split("=")
        newConfig = JSON.parse(nameConfigPair[1]);
        configs.push(newConfig)
    }
    return configs
}

function getCurrentMapObject(possibleCytoscapeMaps) {
    for(var i = 0; i < possibleCytoscapeMaps.length; i++) {
        if (possibleCytoscapeMaps[i]['current']) {
            return possibleCytoscapeMaps[i]['map'];
        }
    }
}

// Assembles each frame in a full animation
function assembleFullAnimation(simulationResults, cy, currentAnimation, frameToPauseOn) {
    console.log('assembling full', simulationResults)
    var frames = simulationResults['frames']
    var simulationSpecific = simulationResults['simulationSpecific'];
    var fullAnimation = new Array(frames.length);
    for (var i = 0; i < frames.length; i++) {
        fullAnimation[i] = assembleAnimationFrame(frames[i]['frame'], currentAnimation, cy, fullAnimation, frameToPauseOn, simulationSpecific);
    }
    currentAnimation['frames'] = fullAnimation;
    currentAnimation['simulationSpecific'] = simulationSpecific;
}

// Creates a single animation frame, i.e. a set of nodes each transitioning between two states
// in a particular order
function assembleAnimationFrame(resultFrame, currentAnimation, c, fullAnimation, frameToPauseOn, simulationSpecific) {
    var nodes = [];
    for (var i = 0; i < resultFrame.length; i++) {
        nodes.push(resultFrame[i]['id'])
    }

    console.log("cy.nodes()", cy.nodes())
    var animationFrame = new Array(resultFrame.length);
    var lastInFrame = false;
    for(var i = 0; i < nodes.length; i++) {
        var elementToAnimate = cy.nodes()[nodes[i]]
        console.log("elementToAnimate", elementToAnimate)
        if (i == nodes.length - 1) {
            lastInFrame = true;
        }
        var nodeAnimation = assembleAnimation(elementToAnimate, currentAnimation, i, animationFrame, fullAnimation, frameToPauseOn, simulationSpecific);

        animationFrame[i] = nodeAnimation;
    }

    return animationFrame
}

// Creates a single animation i.e. a single node transitioning between two single states
function assembleAnimation(elementToAnimate, currentAnimation, currentIndex, thisFrame, fullAnimation, frameToPauseOn, simulationSpecific) {
        var lastInFrame = (currentIndex >= thisFrame.length - 1);
        var nodeAnimation = elementToAnimate.animation({
            style: {
                'background-color': activeColor()
            },
            duration: animationTime()
        });
        nodeAnimation['startColor'] = inactiveColor();
        nodeAnimation['element'] = elementToAnimate;

        connectAnimations(nodeAnimation, lastInFrame, thisFrame, currentIndex, fullAnimation, currentAnimation, frameToPauseOn, simulationSpecific)

    return nodeAnimation
}

// Sets callbacks for each animation in a frame, so the full frame will play.
// Also sets callbacks so each frame will know what to kick off when it completes.
function connectAnimations(nodeAnimation, lastInFrame, thisFrame, currentIndex, fullAnimation, currentAnimation, frameToPauseOn, simulationSpecific) {
    // Once the node has animated to its active color, kick off the animation for the next node
    nodeAnimation.promise('completed').then(function() {
        // When the last animation in the frame finishes, play the reverse animation for the frame
        // i.e. go back to their original color.
        // When the last animation in this frame is back to its original, start the next frame
        if (lastInFrame) {
            // When moving forward or backward, the frame should auto-pause
            if (currentAnimation['timestep'] == frameToPauseOn || frameToPauseOn == -2) {
                var frame = currentAnimation['frames'][currentAnimation['timestep']]
                var lastAnimInFrame = frame[frame.length-1]
                enablePlay();
                return;
            }
            setTimeout( function() { // This timeout sets up the amount of time the frame will pause when active
                if (!currentAnimation['paused']) {
                    for (var i = 0; i < thisFrame.length; i++) {
                        thisFrame[i]['startColor'] = activeColor();
                        thisFrame[i].reverse()
                                    .rewind();
                        // Last in frame kicks off next frame
                        if (i >= thisFrame.length - 1) {
                            thisFrame[i].promise('completed').then(function() {
                                console.log("frame finishing...");
                                console.log(currentAnimation)
                                currentAnimation["timestep"]++;
                                if (currentAnimation["timestep"] < fullAnimation.length) {
                                    $('#frame-tracker').text(currentIndex + 2 + '/' + fullAnimation.length);
                                    updateAStarPriorityQueue(simulationSpecific[currentAnimation["timestep"]])
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

// Pauses each animation in a frame
function pauseFrame(frame) {
    console.log("pausing")
    console.log(frame)
    for (var i = 0; i < frame.length; i++) {
        if (frame[i]['startColor'] == inactiveColor()) {
            frame[i].progress(0.99).apply().pause();
            console.log("applying progress 0.99")
        } else {
            frame[i].progress(0.0).apply().pause();
        }
    }
}

// Plays the currently displayed frame
function playFrame(frameInfo) {
    if (frameInfo['timestep'] > frameInfo['numFrames'] || frameInfo['timestep'] < 0) {
        return
    }
    console.log("playing frame")
    console.log(frameInfo)
    $('#frame-tracker').text(frameInfo['timestep'] + 1 + '/' + frameInfo['numFrames']);
    frameInfo['frame'][0].play();
    updateAStarPriorityQueue(frameInfo["simulationSpecific"], frameInfo['cy']);
}

// This will reset all active elements back to inactive, then execute setFrameFunction
// which rebuilds the animations and starts at a specific frame
function resetFrame(frame, setFrameFunction, setFrameFunctionParameters) {
    console.log("resetting")
    console.log("frame in reset")
    console.log(frame)
    var resetAnim;
    // for (var i = 0; i < frame.length; i++) {
    //     resetAnim = frame[i]['element'].animation({
    //         style: {
    //             'background-color': inactiveColor()
    //         },
    //         duration: resetTime()
    //     });
    //     resetAnim.play();
    //     if (i == frame.length - 1 && setFrameFunction != null) {
    //         resetAnim.promise('completed').then(function() {
    //             setFrameFunction(setFrameFunctionParameters);
    //         });
    //     }
    // }

    for (var i = 0; i < cy.nodes().length; i++) {
        console.log(cy.nodes()[i])
        resetAnim = cy.nodes()[i].animation({
            style: {
                'background-color': inactiveColor()
            },
            duration: resetTime()
        });
        if (cy.nodes()[i] == frame[frame.length-1]['element'] && setFrameFunction != null) {
            resetAnim.promise('completed').then(function() {
                setFrameFunction(setFrameFunctionParameters);
            });
        }
        resetAnim.play();
    }
}

// Start the next frame after resetting
function frameForward(simulationInfo) {
    var simulationResults = simulationInfo['results'];
    var cy = simulationInfo['cy'];
    var currentAnimation = simulationInfo['animation'];
    var frameToReset;
    if (currentAnimation['timestep'] == currentAnimation['frames'].length - 1) {
        return;
    }
    console.log("forward timestep: " + currentAnimation['timestep'])
    disablePlay();
    disablePause();
    var frameParam;
    if (getDisplayedFrame() != 0) {
        currentAnimation['timestep']++;
    }
    assembleFullAnimation(simulationResults, cy, currentAnimation, -2);

    frameInfo = {
        frame: currentAnimation['frames'][currentAnimation['timestep']],
        timestep: currentAnimation['timestep'],
        numFrames: currentAnimation['frames'].length,
        simulationSpecific: simulationResults['simulationSpecific'][currentAnimation['timestep']]
    }

    //Need to reset the frame prior to the one about to be played
    currentAnimation['timestep'] = 0;
    if (currentAnimation['timestep'] > 1) {
        frameToReset = currentAnimation['timestep'] - 1;
    }

    resetFrame(currentAnimation['frames'][currentAnimation['timestep']], playFrame, frameInfo);
}

// Start the previous frame after resetting
function frameBackward(simulationInfo) {
    var simulationResults = simulationInfo['results'];
    var cy = simulationInfo['cy'];
    var currentAnimation = simulationInfo['animation'];
    console.log("backward timestep: " + currentAnimation['timestep'])

    if (currentAnimation['timestep'] == 0) {
        return;
    } else {
        currentAnimation['timestep']--;
    }
    disablePlay();
    disablePause();
    var frameParam;
    assembleFullAnimation(simulationResults, cy, currentAnimation, -2);

    frameInfo = {
        frame: currentAnimation['frames'][currentAnimation['timestep']],
        timestep: currentAnimation['timestep'],
        numFrames: currentAnimation['frames'].length,
        simulationSpecific: simulationResults['simulationSpecific'][currentAnimation['timestep']]
    }

    resetFrame(currentAnimation['frames'][currentAnimation['timestep']+1], playFrame, frameInfo);
}

// Starts the next frame
function startNextFrame(simulationInfo) {
    var simulationResults = simulationInfo['results'];
    var cy = simulationInfo['cy'];
    var currentAnimation = simulationInfo['animation'];

    currentAnimation['timestep']++;
    console.log("starting next frame: " + currentAnimation['timestep'])
    currentAnimation = {
        timestep: currentAnimation['timestep'],
        frames: [],
        paused: false,
        finished: false
    };
    assembleFullAnimation(simulationResults, cy, currentAnimation, currentAnimation['timestep']);
    playFrame(currentAnimation['frames'][currentAnimation['timestep']], currentAnimation['timestep'], currentAnimation['frames'].length);
}

// Reassembles the animations so promises are set, kicks off at a specific frame
function restartAnim(simulationInfo) {
    var simulationResults, cy, currentAnimation, frameInfo;
    simulationResults = simulationInfo['results'];
    cy = simulationInfo['cy'];
    currentAnimation = simulationInfo['animation'];
    // currentAnimation['timestep'] = 0;
    assembleFullAnimation(simulationInfo['results'], simulationInfo['cy'], simulationInfo['animation'], DONTPAUSE());
    frameInfo = {
        frame: currentAnimation['frames'][currentAnimation['timestep']],
        timestep: currentAnimation['timestep'],
        numFrames: currentAnimation['frames'].length,
        cy: cy
    }
    playFrame(frameInfo);
}

// Starts an animation from the first frame
function playFromBeginning(simulationInfo) {
    console.log("playing from beginning", simulationInfo)
    var simulationResults = simulationInfo['results'];
    var cy = simulationInfo['cy'];
    var currentAnimation = simulationInfo['animation'];

    assembleFullAnimation(simulationResults, cy, currentAnimation, DONTPAUSE());
    var frameInfo = {
        frame: currentAnimation['frames'][currentAnimation['timestep']],
        timestep: currentAnimation['timestep'],
        numFrames: currentAnimation['frames'].length,
        simulationSpecific: simulationResults['simulationSpecific'][currentAnimation['timestep']],
        cy: cy
    }
    playFrame(frameInfo);
}

// Pauses an animation at a specific frame
function pauseAtFrame(frameNumber, simulationInfo) {
    var simulationResults = simulationInfo['results'];
    var cy = simulationInfo['cy'];
    var currentAnimation = simulationInfo['animation'];

    assembleFullAnimation(simulationResults, cy, currentAnimation, frameNumber);
    playFrame(currentAnimation['frames'][currentAnimation['timestep']], frameNumber, currentAnimation['frames'].length);
}