// It is expect that the simulation specific configuration modules implement at the least:
// cyConstructor(), nodeData(), edgeData()

(function() {
    // Generic configuration module constructor
    function genericConfigurationModule() {
        // self is used in scenarios where the programmer is trying to reference this module, but is in a callback function
        var self = this;
        // simple reference to the simulationInterface cy to shorten the name when using it
        this.cy = null;
        // An element is a single element of the cy display
        this.elements = [];
        // Contains x,y coordinates for elements
        this.positionsArr = [];
        // List of configurations associated with the simulation
        this.configs = [];
        // List of configurations that are included by default. i.e. these are the configurations not created and saved by the user.
        this.defaultConfigs = []
        // Reference to the configuration currently being viewed.
        this.currentConfig = null;

        // Number of vertical pixels for each cy element
        this.nodeHeight = function() {
            return 30;
        }
        
        // Number of horizontal pixels for each cy element
        this.nodeWidth = function() {
            return 30;
        }
        
        // Number of vertical pixels between grid lines
        this.gridHeight = function() {
            return 40;
        }
        
        // Number of horizontal pixels between grid lines
        this.gridWidth = function() {
            return 40;
        }

        // Disable the movement of nodes
        this.lockNodes = function() {
            this.cy.nodes().lock();
            $('#lock-locked').show();
            $('#lock-unlocked').hide();
        }
        
        // Enable the movement of nodes
        this.unlockNodes = function() {
            this.cy.nodes().unlock();    
            $('#lock-locked').hide();
            $('#lock-unlocked').show();
        }

        /* 
        Renders the CY map and handles node specific properties such as clicking and locking
        */
        this.setCytoscape = function() {
            this.buildElementStructure();
            this.cy = this.cyConstructor();
            var cy = this.cy;
            var self = this;

            cy.ready(function () {
                cy.nodes().positions(function (ele, i) {
                    return {
                        x: self.positionsArr[i].x,
                        y: self.positionsArr[i].y
                    }
                });
                self.lockNodes();
            });

            cy.nodes().each(function (node) {
                if (node.connectedEdges().length != 4) {
                    return {};
                }
                cy.$('#' + node.id()).qtip(self.qtipStructure(node));
            });

            cy.gridGuide(this.gridInfo())

            SimulationInterface.cy = cy;
            SimulationInterface.toolbarModule.setConfig();
        }

        /* 
        Assembles the object used to render the CY map
        */
        this.buildElementStructure = function() {
            var nodeMap = {};
            var i;

            var elements = [];
            this.positionsArr = [];
            var currentConfig = this.currentConfig;
            // Collect information on nodes
            for (i = 0; i < currentConfig.nodes.length; i++) {
                heuristic = 1;
                elements.push({
                    data: this.nodeData(currentConfig.nodes[i]),
                    classes: 'multiline-manual'
                })
                if (this.currentSimulation == "AStar") {
                    nodeMap[currentConfig.nodes[i].id.replace(' ', '_')] = i;
                }
            }
            // Collect information on connections
            for (i = 0; i < currentConfig.edges.length; i++) {
                realDistance = currentConfig.edges[i].distance
                label = "g: " + realDistance;
                elements.push({
                    data: this.edgeData(currentConfig.edges[i]),
                })
            }
            self.elements = elements;
        }

        /* 
        Puts the names of each configuration into the dropbox selector
        and associates it with the configuration object when selected
        */
        this.setConfigurationsInSelector = function() {
            var configSelector = $('#configuration-selector');
            var i;
            var configs;
    
            configSelector.empty();
            this.configs = Object.values(jQuery.extend(true, {}, this.defaultConfigs))
            this.collectCookieConfigurations();
            configs = this.configs;
        
            // Push all configs into the dropbox options
            for (i = 0; i < configs.length; i++) {
                configSelector.append($('<option></option>').val(i).html(configs[i].name));
            }
            
            // When an option is selected, we need to update the currentConfig and cy
            this.currentConfig = configs[0];
            configSelector.on('change', function () {
                self.currentConfig = configs[this.value];
                $('#sidenavToggler').click(function () {
                    this.cy.resize();
                });
                for (var i = 0; i < configs.length; i++) {
                    if (i == this.value) {
                        self.setCytoscape();
                    }
                }
            })
            // Initialize to first config
            this.setCytoscape();
        },

        /*
        Collects any configurations that were created and saved by the user
        */
        this.collectCookieConfigurations = function() {
            var cookies = document.cookie.split("; ");
            var nameConfigPair;
            var newConfig;
            var i;
            if (cookies[0] == "" && cookies.length == 1) 
                return;
        
            for (i = 0; i < cookies.length; i++) {
                nameConfigPair = cookies[i].split("=")
                newConfig = JSON.parse(nameConfigPair[1]);
                this.configs.push(newConfig)
            }
        }

        /*
        Contains all configuration information for the cy grid
        */
        this.gridInfo = function() {
            return {
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
                gridSpacing: self.gridHeight(), // Distance between the lines of the grid.

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
            }
        }
    }

    // Give interface a handle to the generic configuration module constructor
    SimulationInterface.genericConstructors.configuration = genericConfigurationModule;
})();