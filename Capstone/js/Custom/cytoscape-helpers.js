var cy;
var configs;
var currentConfig;
var defaultConfigs;


// Constants
function inactiveColor() {
    return 'black';
}

function activeColor() {
    return 'cornflowerblue';
}

function inadmissibleColor() {
    return 'red';
}

function inconsistentColor() {
    return 'darkorange';
}
function inadmissibleAndInconsistentColor() {
    return 'silver';
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
    return $('#frame-tracker').val()
}


function setDisplayedFrame(frameCount) {
    $('#frame-tracker').val(frameCount)
    var numLength = (frameCount + '').length + 2;
    $('#frame-tracker').width(numLength * 8 + 'px');
}

function setMaxFrameCount(frameCount) {
    $('#max-frame-count').text("/"+frameCount);
}

function setCurrentFrame(frameNumber) {
    $('#frame-tracker').text(frameNumber);
}

function DONTPAUSE() {
    return -1;
}

// Need to manually save off original and fullscreen sizes,
// because cy will not dynamically adjust sizes
function toggleFullscreen() {
    cy.originalWidth = cy.size()['width'];
    cy.originalHeight = cy.size()['height'];
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
    if (cy.fullscreenHeight != undefined) {
        $('#cy').css('height', cy.fullscreenHeight);
        $('#cy').css('width', cy.fullscreenWidth);
    }
    
    cy.resize();
}

function closeFullscreen() {
    cy.fullscreenWidth = cy.size()['width'];
    cy.fullscreenHeight = cy.size()['height'];
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
    $('#cy').css('height', cy.originalHeight);
    $('#cy').css('width', cy.originalWidth);
    cy.resize();
}

function enableGridSnapping() {
    cy.gridGuide({
        // On/Off Modules
        /* From the following four snap options, at most one should be true at a given time */
        snapToGridOnRelease: false, // Snap to grid on release
        snapToGridDuringDrag: true, // Snap to grid during drag
        snapToAlignmentLocationOnRelease: false, // Snap to alignment location on release
        snapToAlignmentLocationDuringDrag: false, // Snap to alignment location during drag
        drawGrid: true, // Draw grid background
    })
    $('#disable-grid-snapping').show();
    $('#enable-grid-snapping').hide();
}

function disableGridSnapping() {
    cy.gridGuide({
        // On/Off Modules
        /* From the following four snap options, at most one should be true at a given time */
        snapToGridOnRelease: false, // Snap to grid on release
        snapToGridDuringDrag: false, // Snap to grid during drag
        snapToAlignmentLocationOnRelease: false, // Snap to alignment location on release
        snapToAlignmentLocationDuringDrag: false, // Snap to alignment location during drag
        drawGrid: false, // Draw grid background
    })
    $('#disable-grid-snapping').hide();
    $('#enable-grid-snapping').show();
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

function nodeHeight() {
    return 30;
}

function nodeWidth() {
    return 30;
}

function gridHeight() {
    return 40;
}

function gridWidth() {
    return 40;
}

function pauseOnThisFrame() {
    return -2;
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
                    label: 'data(label)',
                    height: nodeHeight(),
                    width: nodeWidth(),
                    'border-width': 2,
                    'border-color': inactiveColor()
                }
            },
            {
                selector: 'edge',
                style: {
                    label: 'data(label)',
                    'color': 'white',
                    'text-background-color': 'black',
                    'text-background-opacity': 1,
                    'text-background-padding': 4,
                    'text-background-shape': 'roundrectangle',
                    'line-style': 'dashed',
                    // 'edge-text-rotation': 'autorotate',
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
        wheelSensitivity: 0.2,
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
                    var connecting; 
                    if ($('#add-connection-label').is(':visible')) {
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
            }
        });
    });

    cy.gridGuide({
        // On/Off Modules
        /* From the following four snap options, at most one should be true at a given time */
        snapToGridOnRelease: true, // Snap to grid on release
        snapToGridDuringDrag: true, // Snap to grid during drag
        snapToAlignmentLocationOnRelease: false, // Snap to alignment location on release
        snapToAlignmentLocationDuringDrag: true, // Snap to alignment location during drag
        distributionGuidelines: false, // Distribution guidelines
        geometricGuideline: false, // Geometric guidelines
        initPosAlignment: false, // Guideline to initial mouse position
        centerToEdgeAlignment: false, // Center to edge alignment
        resize: false, // Adjust node sizes to cell sizes
        parentPadding: false, // Adjust parent sizes to cell sizes by padding
        drawGrid: true, // Draw grid background

        // General
        gridSpacing: gridHeight(), // Distance between the lines of the grid.

        // Draw Grid
        zoomDash: true, // Determines whether the size of the dashes should change when the drawing is zoomed in and out if grid is drawn.
        panGrid: true, // Determines whether the grid should move then the user moves the graph if grid is drawn.
        gridStackOrder: 4, // Namely z-index
        gridColor: '#dedede', // Color of grid lines
        lineWidth: 1.0, // Width of grid lines

        // Guidelines
        guidelinesStackOrder: 4, // z-index of guidelines
        guidelinesTolerance: 2.00, // Tolerance distance for rendered positions of nodes' interaction.
        guidelinesStyle: { // Set ctx properties of line. Properties are here:
            strokeStyle: "#8b7d6b", // color of geometric guidelines
            geometricGuidelineRange: 400, // range of geometric guidelines
            range: 100, // max range of distribution guidelines
            minDistRange: 10, // min range for distribution guidelines
            distGuidelineOffset: 10, // shift amount of distribution guidelines
            horizontalDistColor: "#ff0000", // color of horizontal distribution alignment
            verticalDistColor: "#00ff00", // color of vertical distribution alignment
            initPosAlignmentColor: "#0000ff", // color of alignment to initial mouse location
            lineDash: [0, 0], // line style of geometric guidelines
            horizontalDistLine: [0, 0], // line style of horizontal distribution guidelines
            verticalDistLine: [0, 0], // line style of vertical distribution guidelines
            initPosAlignmentLine: [0, 0], // line style of alignment to initial mouse position
        },

        // Parent Padding
        parentSpacing: -1 // -1 to set paddings of parents to gridSpacing
    })

    return cy
}

function qtipContent(node, connecting) {
    var content;
    if (connecting) {
        return "<button id='confirm-connection' class='btn' onclick='confirmConnection(\"" +  node.id().replace(' ','_').split(':')[0] + "\")'>Connect to this node</button>"
    }
    // Start and end buttons
    // Add node and connection buttons
    content  = "<div class='operation qtip-sub-div'>"
    content += "<div class='svg-expand pointer second'>"
    content += "<span class='fa oi icon' id='home' data-glyph='home' title='Start Here' aria-hidden='true' onclick=makeStartNode(\"" + node.id().replace(' ','_').split(':')[0] + "\",\"" + node.data('simulationID') + "\")></span>"
    content += "<span class='fa oi icon' id='map-marker' data-glyph='map-marker' title='End Here' aria-hidden='true' onclick=makeGoalNode(\"" + node.id().replace(' ','_').split(':')[0] + "\",\"" + node.data('simulationID') + "\")></span>"
    content += "<span class='fa oi icon' data-toggle='modal' id='plus' data-glyph='plus' title='Add a new node' aria-hidden='true' onclick=promptAddNode(\"" + node.id().replace(' ','_').split(':')[0] + "\")></span>"
    content += "<span class='fa oi icon' data-toggle='modal' id='transfer' data-glyph='transfer' title='Add a new connection' aria-hidden='true' onclick=promptAddConnection(\"" + node.id().replace(' ','_').split(':')[0] + "\")></span>"
    content += "</div>";
    content += "</div>";

    content += "<br>";

    content += "<div class='qtip-sub-div' id='heuristic-div'>";
    content += "<div id='heuristic-input-div'>"
    content += "<label id='heuristic-label'>Heuristic:</label>"
    content += "<input id='heuristic-value-" + node.id() + "' class='heuristic-input' type='number' min='0' step='1' value='" + node.data('heuristic') + "' onkeyup='if (value < 0){ value = 0 }'></input>"
    content += "<div style='padding:2px'></div>"
    content += "<button id='heuristic-update-button' style='width: 100%' class='btn' onclick='setHeuristic(\"" + node.id().replace(' ','_') + "\",\"" + node.data('simulationID') + "\")'>Update</button>"
    content += "</div>"
    content += "</div>"
    return content;
}

function promptAddNode(nodeToConnect) {
    $('.qtip').hide();
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
}

// TODO: disable other buttons
function promptAddConnection(nodeToConnect) {
    $('.qtip').hide();
    $('#add-connection-label').show();
    $('#add-connection-label').children().show();
    $('#connection-header').text(nodeToConnect.replace('_', ' '))
}

function confirmConnection(nodeOne) {
    var nodeTwo = $('#connection-header').text()
    addConnection(nodeOne, nodeTwo);
    $('#add-connection-label').hide();
}

function addConnection(nodeOne, nodeTwo) {
    nodeOne = nodeOne.split(':')[0];
    nodeTwo = nodeTwo.split(':')[0];
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
    checkHeuristics()
}

function setHeuristics() {
    var dijkstra
    var goalID = $('#goal-label').text();
    var nodes = cy.nodes(), node;
    // var goalNodeId = 
    for (var i = 0; i < nodes['length']; i++) {
        node = nodes[i]
        dijkstra = cy.elements().dijkstra('#' + node.id(), function(edge) {
            return edge.data('distance');
        })
        node.data('heuristic', dijkstra.distanceTo(cy.$('#' + goalID)))
        node.data('label', node.id().replace('_', ' ') + ": " + node.data('heuristic'));
    }
}

// Called when the heuristic of a single node is changed
function setHeuristic(id) {
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
    calculateDistances(node.id());
    node.data('heuristic', heuristic);
    node.data('label', node.id().replace('_', ' ') + ": " + heuristic);
    checkHeuristics();
}

// Verifies the admissibility and consistency of all nodes
function checkHeuristics() {
    var nodeAnimation;
    var heuristic;
    var nodes = cy.nodes(), node;
    // var goalNodeId = 
    for (var i = 0; i < nodes['length']; i++) {
        node = nodes[i]
        dijkstra = cy.elements().dijkstra('#' + node.id(), function(edge) {
            return edge.data('distance');
        })

        heuristic = node.data('heuristic')
        var admissible = heuristic <= node.data('distanceToGoal');
        var consistent = consistentHeuristic(node, heuristic);

        if (!admissible && !consistent) {
            nodeAnimation = animateNodeToColor(node, inadmissibleAndInconsistentColor())
            nodeAnimation.play();
        } 
        else if (!admissible) {
            nodeAnimation = animateNodeToColor(node, inadmissibleColor())
            nodeAnimation.play();
        } 
        else if (!consistent) {
            nodeAnimation = animateNodeToColor(node, inconsistentColor())
            nodeAnimation.play();
        } else {
            nodeAnimation = animateNodeToColor(node, inactiveColor())
            nodeAnimation.play();
        }
    }
}

function animateNodeToColor(node, color) {
    var anim = node.animation({
        style: {
            'background-color': color,
        },
        duration: animationTime()
    });
    return anim;
}

// Iterate through edges, grabbing the nodes on the other side
// If heuristic > the edge distance + other nodes heuristic, it is inconsistent
function consistentHeuristic(node, heuristic) {
    var isConsistent = true;
    var otherNode;
    node.connectedEdges().each(function(edge){
        otherNode = (edge.data('source') == node.id()) ? cy.$('#' + edge.data('target'))[0] : cy.$('#' + edge.data('source'))[0];
        if (heuristic > (edge.data('distance') + otherNode.data('heuristic'))) {
            isConsistent = false;
        }
    })
    return isConsistent;
}

// TODO: If running into performance concerns, this calculation could probably be moved
function calculateDistances() {
    var dijkstra
    var goalID = $('#goal-label').text();
    // var goalNodeId = 
    for (var i = 0; i < cy.nodes()['length']; i++) {
        dijkstra = cy.elements().dijkstra('#' + cy.nodes()[i].id(), function(edge) {
            return edge.data('distance');
        })
        cy.nodes()[i].data('distanceToGoal', dijkstra.distanceTo(cy.$('#' + goalID)))
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
                label: currentConfig.nodes[i].id.replace('_', ' '),
                distanceToGoal: -1,
                heuristic: heuristic,
                position: {
                    x: currentConfig.nodes[i].x,
                    y: currentConfig.nodes[i].y
                }
            },
            classes: 'multiline-manual'
        })
        nodeMap[currentConfig.nodes[i].id.replace(' ', '_')] = i;
        positionsArr.push({
            x: currentConfig.nodes[i].x,
            y: currentConfig.nodes[i].y
        })
    }

    var heuristic = 1;
    var realDistance;
    for (var i = 0; i < currentConfig.edges.length; i++) {
        realDistance = currentConfig.edges[i].distance
        label = "g: " + realDistance;
        elements.push({
            data: {
                id: currentConfig.edges[i].id,
                elementType: "edge",
                simulationID: i,
                distance: realDistance,
                label: label,
                source: currentConfig.edges[i].source.replace(' ','_'),
                target: currentConfig.edges[i].target.replace(' ','_'),
                sourceID: nodeMap[currentConfig.edges[i].source.replace(' ','_')],
                targetID: nodeMap[currentConfig.edges[i].target.replace(' ','_')]
            }
        })
    }
}

function setConfigurationsInSelector() {
    var configSelector = $('#configuration-selector');
    configSelector.empty();
    configs = Object.values(jQuery.extend(true, {}, defaultConfigs))
    configs = collectCookieConfigurations();

    // Push all configs into the dropbox options
    for (var i = 0; i < configs.length; i++) {
        configSelector.append($('<option></option>').val(i).html(configs[i].name));
    }
    
    // When an option is selected, we need to update the currentConfig and cy
    currentConfig = configs[0];
    configSelector.on('change', function () {
        currentConfig = configs[this.value];
        $('#sidenavToggler').click(function () {
            cy.resize();
        });
        for (var i = 0; i < configs.length; i++) {
            if (i == this.value) {
                cy = setCytoscape(currentConfig);
            }
        }
    })
}

function collectCookieConfigurations() {
    var cookies = document.cookie.split("; ")
    if (cookies[0] == "" && cookies.length == 1) 
        return configs;
    var nameConfigPair;
    var newConfig;

    for (var i = 0; i < cookies.length; i++) {
        nameConfigPair = cookies[i].split("=")
        newConfig = JSON.parse(nameConfigPair[1]);
        configs.push(newConfig)
    }
    return configs;
}


// Assembles each frame in a full animation
function assembleFullAnimation(simulationResults, cy, currentAnimation, frameToPauseOn) {
    var frames = simulationResults['frames']
    var simulationSpecific = simulationResults['simulationSpecific'];
    var fullAnimation = new Array(frames.length);
    for (var i = 0; i < frames.length; i++) {
        fullAnimation[i] = assembleAnimationFrame(frames[i]['frame'], currentAnimation, cy, fullAnimation, frameToPauseOn, simulationSpecific, i);
    }
    currentAnimation['frames'] = fullAnimation;
    currentAnimation['simulationSpecific'] = simulationSpecific;
}

// Creates a single animation frame, i.e. a set of nodes each transitioning between two states
// in a particular order
function assembleAnimationFrame(resultFrame, currentAnimation, c, fullAnimation, frameToPauseOn, simulationSpecific, frameNumber) {
    var nodes = [];
    for (var i = 0; i < resultFrame.length; i++) {
        nodes.push(resultFrame[i]['id'])
    }

    var animationFrame = new Array(resultFrame.length);
    for(var i = 0; i < nodes.length; i++) {
        var elementToAnimate = cy.nodes()[nodes[i]]
        if (i == nodes.length - 1) {
            var lastInFrame = true;
        }
        var nodeAnimation = assembleAnimation(elementToAnimate, currentAnimation, frameNumber, animationFrame, fullAnimation, frameToPauseOn, simulationSpecific, lastInFrame, i);

        animationFrame[i] = nodeAnimation;
    }

    return animationFrame
}

// Creates a single animation i.e. a single node transitioning between two single states
function assembleAnimation(elementToAnimate, currentAnimation, currentIndex, thisFrame, fullAnimation, frameToPauseOn, simulationSpecific, lastInFrame, nodeNumberInFrame) {
        var nodeAnimation = elementToAnimate.animation({
            style: {
                'background-color': activeColor()
            },
            duration: animationTime()
        });
        nodeAnimation['startColor'] = inactiveColor();
        nodeAnimation['element'] = elementToAnimate;

        connectAnimations(nodeAnimation, lastInFrame, thisFrame, currentIndex, fullAnimation, currentAnimation, frameToPauseOn, simulationSpecific, nodeNumberInFrame)

    return nodeAnimation
}

// Sets callbacks for each animation in a frame, so the full frame will play.
// Also sets callbacks so each frame will know what to kick off when it completes.
function connectAnimations(nodeAnimation, lastInFrame, thisFrame, currentIndex, fullAnimation, currentAnimation, frameToPauseOn, simulationSpecific, nodeNumberInFrame) {
    // Once the node has animated to its active color, kick off the animation for the next node
    nodeAnimation.promise('completed').then(function() {
        // When the last animation in the frame finishes, play the reverse animation for the frame
        // i.e. go back to their original color.
        // When the last animation in this frame is back to its original, start the next frame
        if (lastInFrame) {
            // When moving forward or backward, the frame should auto-pause
            if (currentAnimation['timestep'] == frameToPauseOn || frameToPauseOn == pauseOnThisFrame()) {
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
                            thisFrame[i].promise('completed').then(function() { // Frame finishing
                                currentAnimation["timestep"]++;
                                if (currentAnimation["timestep"] < fullAnimation.length) {
                                    setDisplayedFrame(currentIndex + 2);
                                    console.log("simulationSpecific:", simulationSpecific)
                                    fullAnimation[currentAnimation["timestep"]][0].play();
                                } else { // Last frame has finished - animation is complete
                                    currentAnimation["timestep"] = 0;
                                    currentAnimation["finished"] = true;
                                    setDisplayedFrame(0);
                                    clearAStarPriorityQueue();
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
            console.log(nodeNumberInFrame + " trying to play next node in this frame:", thisFrame)
            var nextInFrame = thisFrame[nodeNumberInFrame + 1];
            nextInFrame.play();
        }
    });
}

// Pauses each animation in a frame
function pauseFrame(frame) {
    for (var i = 0; i < frame.length; i++) {
        if (frame[i]['startColor'] == inactiveColor()) {
            frame[i].progress(0.99).apply().pause();
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
    setDisplayedFrame(frameInfo['timestep'] + 1)
    frameInfo['frame'][0].play();
    updateAStarPriorityQueue(frameInfo["simulationSpecific"], frameInfo['cy']);
}

function displayFrame(frameInfo) {
    if (frameInfo['timestep'] > frameInfo['numFrames'] || frameInfo['timestep'] < 0) {
        return
    }
    var frameSize = frameInfo['frame'].length - 1;
    var simulationInfo = frameInfo.simulationInfo
    var simulationResults = simulationInfo['results'];
    var cy = simulationInfo['cy'];
    var currentAnimation = simulationInfo['animation'];

    currentAnimation['timestep']++;
    currentAnimation = {
        timestep: currentAnimation['timestep'],
        frames: [],
        paused: false,
        finished: false
    };
    assembleFullAnimation(simulationResults, cy, currentAnimation, pauseOnThisFrame());
    var playframeInfo = {
        timestep: currentAnimation.timestep - 1,
        numFrames: currentAnimation.frames.length,
        cy: cy,
        frame: currentAnimation.frames[currentAnimation.timestep-1]
    }
    updateAStarPriorityQueue(frameInfo["simulationSpecific"], frameInfo['cy']);
    playFrame(playframeInfo);
}

// This will reset all active elements back to inactive, then execute setFrameFunction
// which rebuilds the animations and starts at a specific frame
function resetFrame(frame, setFrameFunction, setFrameFunctionParameters) {
    var resetAnim;
    for (var i = 0; i < cy.nodes().length; i++) {
        resetAnim = cy.nodes()[i].animation({
            style: {
                'background-color': inactiveColor()
            },
            duration: resetTime()
        });
        if (i == cy.nodes().length-1 && setFrameFunction != null) {
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
    disablePlay();
    disablePause();
    var frameParam;
    if (getDisplayedFrame() != 0) {
        currentAnimation['timestep']++;
    }
    assembleFullAnimation(simulationResults, cy, currentAnimation, pauseOnThisFrame());

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

    if (currentAnimation['timestep'] == 0) {
        return;
    } else {
        currentAnimation['timestep']--;
    }
    
    disablePlay();
    disablePause();
    var frameParam;
    assembleFullAnimation(simulationResults, cy, currentAnimation, pauseOnThisFrame());

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