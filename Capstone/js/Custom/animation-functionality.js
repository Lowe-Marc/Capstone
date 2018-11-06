var AnimationHandler = {
    // General variables

    currentSimulation: "",
    cy: null,
    elements: [],
    positionsArr: [],
    configs: [],
    currentConfig: [],
    defaultConfigs: [],

    // Constants

    inactiveColor: function() {
        return 'black';
    },

    activeColor: function() {
        return 'cornflowerblue';
    },

    inadmissibleColor: function() {
        return 'red';
    },

    inconsistentColor: function() {
        return 'darkorange';
    },

    inadmissibleAndInconsistentColor: function() {
        return 'silver';
    },

    // Time in ms it takes to reset after pausing
    resetTime: function() {
        return 500;
    },

    // Time in ms it takes for each animation in a frame to activate
    animationTime: function() {
        return 200;
    },

    // Time in ms nodes will stay active during a frame
    animationActiveTime: function() {
        return 1000;
    },

    DONTPAUSE: function() {
        return -1;
    },

    nodeHeight: function() {
        return 30;
    },
    
    nodeWidth: function() {
        return 30;
    },
    
    gridHeight: function() {
        return 40;
    },
    
    gridWidth: function() {
        return 40;
    },
    
    pauseOnThisFrame: function() {
        return -2;
    },

    // Renders the CY map and handles node specific properties such as clicking and locking
    setCytoscape: function() {
        AnimationHandler.buildElementStructure();

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
            elements: AnimationHandler.elements,
            zoom: 1,
            pan: { x: 0, y: 0 },
            minZoom: 1e-1,
            maxZoom: 1,
            wheelSensitivity: 0.2,
        });

        cy.ready(function () {
            cy.nodes().positions(function (ele, i) {
                return {
                    x: AnimationHandler.positionsArr[i].x,
                    y: AnimationHandler.positionsArr[i].y
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

        AnimationHandler.cy = cy;
    },

    // Assembles the object used to render the CY map
    buildElementStructure: function() {
        var nodeMap = {};
        var label;
        var heuristic = 1;
        var realDistance;
        var i;

        var elements = [];
        var positionsArr = [];
        var currentConfig = AnimationHandler.currentConfig;
        // Collect informaiton on nodes
        for (i = 0; i < currentConfig.nodes.length; i++) {
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
        // Collect informaiton on connections
        for (i = 0; i < currentConfig.edges.length; i++) {
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
        AnimationHandler.elements = elements;
        AnimationHandler.positionsArr = positionsArr;
    },

    setConfigurationsInSelector: function() {
        var configSelector = $('#configuration-selector');
        var i;
        var configs;

        configSelector.empty();
        AnimationHandler.configs = Object.values(jQuery.extend(true, {}, AnimationHandler.defaultConfigs))
        collectCookieConfigurations();
        configs = AnimationHandler.configs;
    
        // Push all configs into the dropbox options
        for (i = 0; i < configs.length; i++) {
            configSelector.append($('<option></option>').val(i).html(configs[i].name));
        }
        
        // When an option is selected, we need to update the currentConfig and cy
        AnimationHandler.currentConfig = configs[0];
        configSelector.on('change', function () {
            AnimationHandler.currentConfig = configs[this.value];
            $('#sidenavToggler').click(function () {
                AnimationHandler.cy.resize();
            });
            for (var i = 0; i < configs.length; i++) {
                if (i == this.value) {
                    AnimationHandler.setCytoscape();
                }
            }
        })
        // Initialize to first config
        AnimationHandler.setCytoscape();
    },

    collectCookieConfigurations: function() {
        var cookies = document.cookie.split("; ");
        var nameConfigPair;
        var newConfig;
        var i;
        if (cookies[0] == "" && cookies.length == 1) 
            return;
    
        for (i = 0; i < cookies.length; i++) {
            nameConfigPair = cookies[i].split("=")
            newConfig = JSON.parse(nameConfigPair[1]);
            AnimationHandler.configs.push(newConfig)
        }
    },
};

