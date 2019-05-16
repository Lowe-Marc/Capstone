(function() {

    function RLConfigurationModule() {
        SimulationInterface.genericConstructors.configuration.call(this);
        self = this;

        this.PASSABLE = 0;
        this.WALL = 1;
        this.SLIPPERY = 2;
        this.GOAL = 3;
        this.START = 4;
        this.HOLE = 5;

        this.LEFT = function() {
            return 'data:image/png;base64,' + this.images[0];
        }

        this.RIGHT = function() {
            return 'data:image/png;base64,' + this.images[1];
        }

        this.TOP = function() {
            return 'data:image/png;base64,' + this.images[2];
        }

        this.BOTTOM = function() {
            return 'data:image/png;base64,' + this.images[3];
        }

        this.imageForDirection = function(direction) {
            switch (direction) {
                case SimulationInterface.animationModule.LEFT():
                    return this.LEFT();
                case SimulationInterface.animationModule.RIGHT():
                    return this.RIGHT();
                case SimulationInterface.animationModule.TOP():
                    return this.TOP();
                case SimulationInterface.animationModule.BOTTOM():
                    return this.BOTTOM();
            }
        }

        this.nodeColor = function(cellType) {
            switch (cellType) {
                case this.GOAL:
                    return 'gold';
                case this.START:
                    return 'DarkSalmon';
                case this.PASSABLE:
                    return 'silver';
                case this.WALL:
                    return 'black';
                case this.SLIPPERY:
                    return 'LightSkyBlue';
                case this.HOLE:
                    return 'Peru';
                default:
                    return 'red'
            }
        }

        this.nodeStyle = function(cellType) {
            return {
                shape: 'roundrectangle',
                'background-color': this.nodeColor(cellType),
                height: this.nodeHeight(),
                width: this.nodeWidth(),
            }
        }
    
        this.edgeStyle = function() {
            return {
            }
        }

        // Positions need the offset to keep the cells contained within the grid,
        // scaling to the grid size, and offset to center the maze
        this.nodeData = function(node) {
            var centerOffset = this.gridWidth()*4;
            var data = {
                id: node.coords.Item1 + "_" + node.coords.Item2,
                elementType: "node",
                cellType: node.cellType,
                position: {
                    x: this.gridWidth()/2 + node.coords.Item1*this.gridWidth(),
                    y: this.gridHeight()/2 + node.coords.Item2*this.gridHeight()
                }
            }
            return Object.assign(this.nodeStyle(node.cellType), data);
        }

        this.edgeData = function(edge) {
            return {
                elementType: "edge",
                distance: 1,
                source: edge.source.Item1 + "_" + edge.source.Item2,
                target: edge.target.Item1 + "_" + edge.target.Item2,
            }
        }

        /*
        Override this function for cookie configurations
        */
        this.collectCookieConfigurations = function() {
            
        }

        this.cyConstructor = function() {
            return cytoscape({
                container: document.getElementById('cy'),
                style: [
                    {
                        selector: 'node[cellType = 0]',
                        style: this.nodeStyle(0)
                    },
                    {
                        selector: 'node[cellType = 1]',
                        style: this.nodeStyle(1)
                    },
                    {
                        selector: 'node[cellType = 2]',
                        style: this.nodeStyle(2)
                    },
                    {
                        selector: 'node[cellType = 3]',
                        style: this.nodeStyle(3)
                    },
                    {
                        selector: 'node[cellType = 4]',
                        style: this.nodeStyle(4)
                    },
                    {
                        selector: 'node[cellType = 5]',
                        style: this.nodeStyle(5)
                    },
                    {
                        selector: 'edge',
                        style: this.edgeStyle(),
                    }
                ],
                layout: {
                    name: 'preset'
                },
                elements: this.elements,
                zoom: 1,
                pan: { x: 0, y: 0 },
                minZoom: 1e-1,
                maxZoom: 1,
                wheelSensitivity: 0.2,
            })
        }

        this.shouldHaveQtip = function(node) {
            return node.connectedEdges().length == 4;
        }

        this.qtipStructure = function(node) {
            $('.qtip').appendTo('#simulation-area');
            if (node.connectedEdges().length != 4) {
                return {};
            }
            return {
                content: {
                    text: function(event, api) {
                        var connecting; 
                        if ($('#add-connection-label').is(':visible')) {
                            connecting = true;
                        }
                        return self.qtipContent(node, connecting);
                    }
                },
                position: {
                    my: 'top center',
                    at: 'bottom center'
                },
                style: {
                    classes: 'qtip-bootstrap',
                }
            }
        }

        this.qtipContent = function(node) {
            $('.qtip').appendTo('#simulation-area');
            var content;
            // Start and end buttons
            // Add node and connection buttons
            content  = "<div class='operation qtip-sub-div'>"
            content += "<div class='svg-expand pointer second'>"
            content += "<span class='fa oi icon' id='home' data-glyph='home' title='Start Here' aria-hidden='true' onclick=self.makeStartNode(\"" + node.id().replace(' ','_').split(':')[0] + "\",\"" + node.data('simulationID') + "\")></span>"
            content += "<span class='fa oi icon' id='map-marker' data-glyph='map-marker' title='End Here' aria-hidden='true' onclick=self.makeGoalNode(\"" + node.id().replace(' ','_').split(':')[0] + "\",\"" + node.data('simulationID') + "\")></span>"
            content += "<span class='fa oi icon' id='transfer' data-glyph='transfer' title='Make passable' aria-hidden='true' onclick=self.makeCellPassable(\"" + node.id().replace(' ','_').split(':')[0] + "\")></span>"
            content += "<span class='fa oi icon' id='shield' data-glyph='shield' title='Make impassable' aria-hidden='true' onclick=self.makeCellImpassable(\"" + node.id().replace(' ','_').split(':')[0] + "\")></span>"
            content += "<span class='fa oi icon' id='target' data-glyph='target' title='Make hole' aria-hidden='true'onclick=self.makeHole(\"" + node.id().replace(' ','_').split(':')[0] + "\")></span>"
            content += "</div>";
            content += "</div>";

            return content;
        }

        this.makeCellPassable = function(nodeID) {
            var node = SimulationInterface.cy.$('#' + nodeID);
            node.cellType = this.PASSABLE;
            var anim = SimulationInterface.animationModule.animateNodeToColor(node, this.nodeColor(node.cellType))
            anim.play();
            SimulationInterface.cy.$('#' + nodeID).data('cellType', this.PASSABLE)
        }

        this.makeCellImpassable = function(nodeID) {
            var node = SimulationInterface.cy.$('#' + nodeID);
            node.cellType = this.WALL;
            var anim = SimulationInterface.animationModule.animateNodeToColor(node, this.nodeColor(node.cellType))
            anim.play();
            SimulationInterface.cy.$('#' + nodeID).data('cellType', this.WALL)
        }

        this.makeCellSlippery = function(nodeID) {
            var node = SimulationInterface.cy.$('#' + nodeID);
            node.cellType = this.SLIPPERY;
            var anim = SimulationInterface.animationModule.animateNodeToColor(node, this.nodeColor(node.cellType))
            anim.play();
            SimulationInterface.cy.$('#' + nodeID).data('cellType', this.SLIPPERY)
        }

        this.makeGoalNode = function(nodeID) {
            var node = SimulationInterface.cy.$('#' + nodeID);
            node.cellType = this.GOAL;
            var anim = SimulationInterface.animationModule.animateNodeToColor(node, this.nodeColor(node.cellType))
            anim.play();
            SimulationInterface.cy.$('#' + nodeID).data('cellType', this.GOAL)
        }

        this.makeStartNode = function(nodeID) {
            var node = SimulationInterface.cy.$('#' + nodeID);
            node.cellType = this.START;
            var anim = SimulationInterface.animationModule.animateNodeToColor(node, this.nodeColor(node.cellType))
            anim.play();
            SimulationInterface.cy.$('#' + nodeID).data('cellType', this.START)
        }

        this.makeHole = function(nodeID) {
            var node = SimulationInterface.cy.$('#' + nodeID);
            node.cellType = this.HOLE;
            var anim = SimulationInterface.animationModule.animateNodeToColor(node, this.nodeColor(node.cellType))
            anim.play();
            SimulationInterface.cy.$('#' + nodeID).data('cellType', this.HOLE)
        }

        this.makeLeft = function(nodeID) {
            var node = SimulationInterface.cy.$('#' + nodeID);
            var anim = SimulationInterface.animationModule.animateNodeToImage(node, this.LEFT())
            anim.play();
        }

        this.makeRight = function(nodeID) {
            var node = SimulationInterface.cy.$('#' + nodeID);
            var anim = SimulationInterface.animationModule.animateNodeToImage(node, this.RIGHT())
            anim.play();
        }

        this.makeBottom = function(nodeID) {
            var node = SimulationInterface.cy.$('#' + nodeID);
            var anim = SimulationInterface.animationModule.animateNodeToImage(node, this.BOTTOM())
            anim.play();
        }

        this.makeTop = function(nodeID) {
            var node = SimulationInterface.cy.$('#' + nodeID);
            var anim = SimulationInterface.animationModule.animateNodeToImage(node, this.TOP())
            anim.play();
        }

        this.makeDirection = function(nodeID, direction, returnHandle) {
            var node = SimulationInterface.cy.$('#' + nodeID);
            var image = this.imageForDirection(direction);
            var anim = SimulationInterface.animationModule.animateNodeToImage(node, image)
            if (returnHandle)
                return anim;
            else
                anim.play();
        }

        this.removeImage = function(nodeID, callbackFunction, functionParams) {
            var node = SimulationInterface.cy.$('#' + nodeID);
            var anim = SimulationInterface.animationModule.animateNodeToRemoveImage(node, this.TOP())
            if (callbackFunction != null)
                SimulationInterface.animationModule.setAnimCallback(anim, callbackFunction, functionParams);
            anim.play();
        }

        this.collectConfig = function() {
            var params = {};
            var nodes = [];
            var index = 0;

            SimulationInterface.cy.nodes().each(function(element) {
                node = {
                    id: index,
                    x: element.id().split("_")[0],
                    y: element.id().split("_")[1],
                    cellType: element.data('cellType')
                }
                if (node.cellType == self.START) {
                    params.startID = index;
                } else if (node.cellType == self.GOAL) {
                    params.goalID = index;
                }
                nodes.push(node);
                index += 1;
            });

            params.nodes = nodes;
            console.log("params:", params)
            return params;
        }
    }

    // Give the simulation interface an instance of the module
    SimulationInterface.availableModules.ReinforcementLearning = {};
    SimulationInterface.availableModules.ReinforcementLearning.configuration = new RLConfigurationModule();
})();