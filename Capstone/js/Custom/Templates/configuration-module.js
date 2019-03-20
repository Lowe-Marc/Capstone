(function() {

    function SimulationNameConfigurationModule() {
        SimulationInterface.genericConstructors.configuration.call(this);
        self = this;

        this.nodeColor = function(cellType) {
            switch (cellType) {
                case 0:
                    return 'black';
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
            this.positionsArr.push({
                x: this.gridWidth()/2 + node.coords.Item1*this.gridWidth() - centerOffset,
                y: this.gridHeight()/2 + node.coords.Item2*this.gridHeight() - centerOffset
            })
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

        this.cyConstructor = function() {
            return cytoscape({
                container: document.getElementById('cy'),
                style: [
                    {
                        selector: 'node[cellType = 0]',
                        style: this.nodeStyle(0)
                    },
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

        this.qtipStructure = function(node) {
            return {
                content: {
                    text: function(event, api) {
                        return self.qtipContent(node);
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
            var content = "";
            return content;
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
            return params;
        }
    }

    // Give the simulation interface an instance of the module
    SimulationInterface.availableModules.SimulationName = {};
    SimulationInterface.availableModules.SimulationName.configuration = new SimulationNameConfigurationModule();
})();