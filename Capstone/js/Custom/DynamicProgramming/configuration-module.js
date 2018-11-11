(function() {

    function DPConfigurationModule() {
        SimulationInterface.genericConstructors.configuration.call(this);
        self = this;

        this.PASSABLE = 0;
        this.WALL = 1;
        this.SLIPPERY = 2;
        this.GOAL = -1;
        this.START = -2

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

        this.nodeData = function(node) {
            this.positionsArr.push({
                x: this.gridWidth()/2 + node.coords.Item1*this.gridWidth(),
                y: this.gridHeight()/2 + node.coords.Item2*this.gridHeight()
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
                    {
                        selector: 'node[cellType = 1]',
                        style: this.nodeStyle(1)
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

        this.qtipStructure = function(node) {
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

        this.qtipContent = function(node, connecting) {
            var content;
            if (connecting) {
                return "<button id='confirm-connection' class='btn' onclick='confirmConnection(\"" +  node.id().replace(' ','_').split(':')[0] + "\")'>Connect to this node</button>"
            }
            // Start and end buttons
            // Add node and connection buttons
            content  = "<div id='operation' class='qtip-sub-div'>"
            content += "<div class='svg-expand pointer second'>"
            content += "<span class='fa oi icon' id='home' data-glyph='home' title='Start Here' aria-hidden='true' onclick=self.makeStartNode(\"" + node.id().replace(' ','_').split(':')[0] + "\",\"" + node.data('simulationID') + "\")></span>"
            content += "<span class='fa oi icon' id='map-marker' data-glyph='map-marker' title='End Here' aria-hidden='true' onclick=self.makeGoalNode(\"" + node.id().replace(' ','_').split(':')[0] + "\",\"" + node.data('simulationID') + "\")></span>"
            content += "<span class='fa oi icon' data-toggle='modal' id='transfer' data-glyph='transfer' title='Make passable' aria-hidden='true' onclick=self.makeCellPassable(\"" + node.id().replace(' ','_').split(':')[0] + "\")></span>"
            content += "<span class='fa oi icon' data-toggle='modal' id='shield' data-glyph='shield' title='Make impassable' aria-hidden='true' onclick=self.makeCellImpassable(\"" + node.id().replace(' ','_').split(':')[0] + "\")></span>"
            content += "<span class='fa oi icon' data-toggle='modal' id='droplet' data-glyph='droplet' title='Make slippery' aria-hidden='true'onclick=self.makeCellSlippery(\"" + node.id().replace(' ','_').split(':')[0] + "\")></span>"
            content += "</div>";
            content += "</div>";

            return content;
        }

        this.makeCellPassable = function(nodeID) {
            var node = SimulationInterface.cy.$('#' + nodeID);
            node.cellType = this.PASSABLE;
            var anim = SimulationInterface.animationModule.animateNodeToColor(node, this.nodeColor(node.cellType))
            anim.play();
        }

        this.makeCellImpassable = function(nodeID) {
            var node = SimulationInterface.cy.$('#' + nodeID);
            node.cellType = this.WALL;
            var anim = SimulationInterface.animationModule.animateNodeToColor(node, this.nodeColor(node.cellType))
            anim.play();
        }

        this.makeCellSlippery = function(nodeID) {
            var node = SimulationInterface.cy.$('#' + nodeID);
            node.cellType = this.SLIPPERY;
            var anim = SimulationInterface.animationModule.animateNodeToColor(node, this.nodeColor(node.cellType))
            anim.play();
        }

        this.makeGoalNode = function(nodeID) {
            var node = SimulationInterface.cy.$('#' + nodeID);
            node.cellType = this.GOAL;
            var anim = SimulationInterface.animationModule.animateNodeToColor(node, this.nodeColor(node.cellType))
            anim.play();
        }

        this.makeStartNode = function(nodeID) {
            var node = SimulationInterface.cy.$('#' + nodeID);
            node.cellType = this.START;
            var anim = SimulationInterface.animationModule.animateNodeToColor(node, this.nodeColor(node.cellType))
            anim.play();
        }
    }

    // Give the simulation interface an instance of the module
    SimulationInterface.availableModules.DynamicProgramming = {};
    SimulationInterface.availableModules.DynamicProgramming.configuration = new DPConfigurationModule();
})();