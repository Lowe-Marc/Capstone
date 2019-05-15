(function() {

    function AStarConfigurationModule() {
        SimulationInterface.genericConstructors.configuration.call(this);
        self = this;
        this.INACTIVE = 0;
        this.ACTIVE = 1;
        this.INADMISSIBLE = 2;
        this.INCONSISTENT = 3;
        this.INADMISSIBLE_AND_INCONSISTENT = 4;

        this.newConnectionSource = null;
        this.newConnectionTarget = null;

        this.nodeHeight = function() {
            return 30;
        }

        this.nodeWidth = function() {
            return 30;
        }

        this.gridHeight = function() {
            return 40;
        }

        this.gridWidth = function() {
            return 40;
        }

        this.nodeColor = function(cellType) {
            switch (cellType) {
                case this.INACTIVE:
                    return 'black';
                case this.ACTIVE:
                    return 'cornflowerblue';
                case this.INADMISSIBLE:
                    return 'red';
                case this.INCONSISTENT:
                    return 'darkorange';
                case this.INADMISSIBLE_AND_INCONSISTENT:
                    return 'silver';
                default:
                    return 'green'
            }
        }

        this.nodeStyle = function(data) {
            return {
                shape: 'ellipse',
                'background-color': self.nodeColor(self.INACTIVE),
                height: self.nodeHeight(),
                width: self.nodeWidth(),
                'border-width': 2,
                'border-color': self.nodeColor(self.INACTIVE)
            }
        }
    
        this.edgeStyle = function(label) {
            return {
                label: label,
                'color': 'white',
                'text-background-color': 'black',
                'text-background-opacity': 1,
                'text-background-padding': 4,
                'text-background-shape': 'roundrectangle',
                'line-style': 'dashed',
            }
        }

        // Positions need the offset to keep the cells contained within the grid,
        // scaling to the grid size, and offset to center the maze
        this.nodeData = function(node, thisNodesIndex) {
            var centerOffset = this.gridWidth()*4;

            var coords;
            if (node.userDefined == undefined) {
                coords = {
                    x: this.gridWidth()/2 + node.coords.Item1*this.gridWidth() - centerOffset,
                    y: this.gridWidth()/2 + node.coords.Item2*this.gridHeight() - centerOffset
                }
            } else {
                coords = {
                    x: node.x,
                    y: node.y
                }
            }

            var data = {
                id: node.id.replace(" ", "_"),
                simulationID: thisNodesIndex,
                heuristic: 1,
                distanceToGoal: -1,
                elementType: "node",
                label: node.id.replace("_", " "),
                position: {
                    x: coords.x,
                    y: coords.y
                },
            }
            return Object.assign(this.nodeStyle(), data);
        }

        this.edgeData = function(edge, thisEdgesIndex, nodeMap) {
            var realDistance = edge.distance
            var label = "g: " + realDistance;
            return {
                id: edge.id,
                simulationID: thisEdgesIndex,
                distance: realDistance,
                elementType: "edge",
                label: label,
                source: edge.source.replace(" ", "_"),
                target: edge.target.replace(" ", "_"),
                sourceID: nodeMap[edge.source.replace(' ','_')],
                targetID: nodeMap[edge.target.replace(' ','_')]
            }
        }

        this.cyConstructor = function() {
            return cytoscape({
                container: document.getElementById('cy'),
                style: [
                    {
                        selector: 'node',
                        style: {
                            shape: 'ellipse',
                            'background-color': self.nodeColor(self.INACTIVE),
                            label: 'data(label)',
                            height: self.nodeHeight(),
                            width: self.nodeWidth(),
                            'border-width': 2,
                            'border-color': self.nodeColor(self.INACTIVE)
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
                elements: this.elements,
                zoom: 1,
                pan: { x: 0, y: 0 },
                minZoom: 1e-1,
                maxZoom: 1,
                wheelSensitivity: 0.2,
            })
        }

        /*
        All nodes must have qtip menus for A*
        */
        this.shouldHaveQtip = function(node) {
            return true;
        }

        this.qtipStructure = function(node) {
            $('.qtip').appendTo('#simulation-area');
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
            $('.qtip').appendTo('#simulation-area');
            var content;
            if (connecting) {
                return "<button id='confirm-connection' class='btn' onclick='self.confirmConnection(\"" +  node.id().replace(' ','_').split(':')[0] + "\")'>Connect to this node</button>"
            }
            // Start and end buttons
            // Add node and connection buttons
            content  = "<div class='operation qtip-sub-div'>"
            content += "<div class='svg-expand pointer second'>"
            content += "<span class='fa oi icon' id='home' data-glyph='home' title='Start Here' aria-hidden='true' onclick=self.makeStartNode(\"" + node.id().replace(' ','_').split(':')[0] + "\",\"" + node.data('simulationID') + "\")></span>"
            content += "<span class='fa oi icon' id='map-marker' data-glyph='map-marker' title='End Here' aria-hidden='true' onclick=self.makeGoalNode(\"" + node.id().replace(' ','_').split(':')[0] + "\",\"" + node.data('simulationID') + "\")></span>"
            content += "<span class='fa oi icon' data-toggle='modal' id='plus' data-glyph='plus' title='Add a new node' aria-hidden='true' onclick=self.promptAddNode(\"" + node.id().replace(' ','_').split(':')[0] + "\")></span>"
            content += "<span class='fa oi icon' data-toggle='modal' id='transfer' data-glyph='transfer' title='Add a new connection' aria-hidden='true' onclick=self.promptAddConnection(\"" + node.id().replace(' ','_').split(':')[0] + "\")></span>"
            content += "</div>";
            content += "</div>";

            content += "<br>";

            content += "<div class='qtip-sub-div' id='heuristic-div'>";
            content += "<div id='heuristic-input-div'>"
            content += "<label id='heuristic-label'>Heuristic:</label>"
            content += "<input id='heuristic-value-" + node.id() + "' class='heuristic-input' type='number' min='0' step='1' value='" + node.data('heuristic') + "' onkeyup='if (value < 0){ value = 0 }'></input>"
            content += "<div style='padding:2px'></div>"
            content += "<button id='heuristic-update-button' style='width: 100%' class='btn' onclick='self.setHeuristic(\"" + node.id().replace(' ','_') + "\")'>Update</button>"
            content += "</div>"
            content += "</div>"
            return content;
        }

        this.promptAddNode = function(nodeToConnect) {
            $('.qtip').hide();
            $('#myModal').show();
            $('#myModal').children().show();
            $('#node-connection-name').val(nodeToConnect.replace('_', ' '));
        }

        this.closeAddNodeMenu = function() {
            $('#myModal').hide();
        }

        this.addNode = function() {
            var nodeToConnect = $('#node-connection-name').val().replace(' ', '_');
            var name = $('#node-name').val().replace(' ', '_');
            var distance = parseInt($('#node-distance').val());
            self.currentConfig.nodes.push({
                id: name,
                coords: {
                    Item1: 0,
                    Item2: 0
                },
                x: 0,
                y: 0
            });

            self.currentConfig.edges.push({
                source: nodeToConnect,
                target: name,
                distance: distance,
            });
            self.setCytoscape(self.currentConfig);
            $('#myModal').hide();
        }

        this.promptAddConnection = function(nodeToConnect) {
            $('.qtip').hide();
            $('#add-connection-label').show();
            $('#add-connection-label').children().show();
            self.newConnectionSource = nodeToConnect.replace('_', ' ')
        }

        this.confirmConnection = function(node) {
            self.newConnectionTarget = node
            self.showAddConnectionModal();
        }

        this.showAddConnectionModal = function() {
            $('#add-connection-label').hide();
            $('#node-one-connection-name').val(self.newConnectionSource.replace('_', ' '));
            $('#node-two-connection-name').val(self.newConnectionTarget.replace('_', ' '));
            $('.qtip').hide();
            $('#add-connection-modal').show();
            $('#add-connection-modal').children().show();
        }

        this.addConnection = function() {
            var distance = parseInt($('#new-connection-distance').val())
            self.currentConfig.edges.push({
                source: self.newConnectionSource,
                target: self.newConnectionTarget,
                distance: distance,
            });
            self.setCytoscape(self.currentConfig);
            self.closeAddConnectionMenu();
        }

        this.closeAddConnectionMenu = function() {
            $('#add-connection-modal').hide();
        }

        this.makeStartNode = function(id, simulationID) {
            $('#start-label').text(id.replace('_', ' '));
            $('#start-id').text(simulationID);
        }

        this.makeGoalNode = function(id, simulationID) {
            $('#goal-label').text(id.replace('_', ' '));
            $('#goal-id').text(simulationID);

            $('#heuristic-value-' + id).val(0)
            SimulationInterface.cy.$('#' + id).data('heuristic', 0);
            self.calculateDistances(id, simulationID);
            self.setHeuristics();
            self.checkHeuristics()
        }

        /*
        Initialized heuristics to the actual optimal distance from each node to the goal
        */
        this.setHeuristics = function() {
            var dijkstra
            var goalID = $('#goal-label').text().replace(" ", "_");
            var nodes = SimulationInterface.cy.nodes(), node;
            for (var i = 0; i < nodes['length']; i++) {
                node = nodes[i]
                dijkstra = SimulationInterface.cy.elements().dijkstra('#' + node.id(), function(edge) {
                    return edge.data('distance');
                })
                node.data('heuristic', dijkstra.distanceTo(SimulationInterface.cy.$('#' + goalID)))
                node.data('label', node.id().replace('_', ' ') + ": " + node.data('heuristic'));
                console.log("node.id():", node.id())
                console.log("dijkstra:", typeof dijkstra.distanceTo(SimulationInterface.cy.$('#' + goalID)))
                console.log("heuristic:", node.data('heuristic'))
                console.log("label:", node.data('label'))
            }
        }

        // Called when the heuristic of a single node is changed
        this.setHeuristic = function(id) {
            id = id.split(":")[0].replace(' ', '_');
            var node = SimulationInterface.cy.$('#' + id);
            node.data('id', id)
            var heuristic = parseInt($('#heuristic-value-' + id).val());
            if (heuristic < 0 || !Number.isInteger(heuristic)) {
                $('#heuristic-value-' + id).addClass('has-error');
                return;
            }
            $('#heuristic-value-' + id).val(heuristic);
            $('#heuristic-value-' + id).removeClass('has-error');
            self.calculateDistances(node.id());
            node.data('heuristic', heuristic);
            node.data('label', node.id().replace('_', ' ') + ": " + heuristic);
            self.checkHeuristics();
        }

        this.checkHeuristics = function() {
            var nodeAnimation;
            var heuristic;
            var nodes = SimulationInterface.cy.nodes(), node;
            for (var i = 0; i < nodes['length']; i++) {
                node = nodes[i]
                dijkstra = SimulationInterface.cy.elements().dijkstra('#' + node.id(), function(edge) {
                    return edge.data('distance');
                })

                heuristic = node.data('heuristic')
                var admissible = heuristic <= node.data('distanceToGoal');
                var consistent = self.consistentHeuristic(node, heuristic);

                if (!admissible && !consistent) {
                    nodeAnimation = SimulationInterface.animationModule.animateNodeToColor(node, self.nodeColor(self.INADMISSIBLE_AND_INCONSISTENT))
                    nodeAnimation.play();
                } 
                else if (!admissible) {
                    nodeAnimation = SimulationInterface.animationModule.animateNodeToColor(node, self.nodeColor(self.INADMISSIBLE))
                    nodeAnimation.play();
                } 
                else if (!consistent) {
                    nodeAnimation = SimulationInterface.animationModule.animateNodeToColor(node, self.nodeColor(self.INCONSISTENT))
                    nodeAnimation.play();
                } else {
                    nodeAnimation = SimulationInterface.animationModule.animateNodeToColor(node, self.nodeColor(self.INACTIVE))
                    nodeAnimation.play();
                }
            }
        }

        this.consistentHeuristic = function(node, heuristic) {
            var isConsistent = true;
            var otherNode;
            node.connectedEdges().each(function(edge){
                otherNode = (edge.data('source') == node.id()) ? SimulationInterface.cy.$('#' + edge.data('target'))[0] : SimulationInterface.cy.$('#' + edge.data('source'))[0];
                if (heuristic > (edge.data('distance') + otherNode.data('heuristic'))) {
                    isConsistent = false;
                }
            })
            return isConsistent;
        }

        this.calculateDistances = function() {
            var dijkstra
            var goalID = $('#goal-label').text().replace(" ", "_");
            
            for (var i = 0; i < SimulationInterface.cy.nodes()['length']; i++) {
                dijkstra = SimulationInterface.cy.elements().dijkstra('#' + SimulationInterface.cy.nodes()[i].id(), function(edge) {
                    return edge.data('distance');
                })
                SimulationInterface.cy.nodes()[i].data('distanceToGoal', dijkstra.distanceTo(SimulationInterface.cy.$('#' + goalID)))
            }
        }

        this.removeImage = function(nodeID, callbackFunction, functionParams) {
            var node = SimulationInterface.cy.$('#' + nodeID);
            var anim = SimulationInterface.animationModule.animateNodeToRemoveImage(node, this.TOP())
            if (callbackFunction != null)
                SimulationInterface.animationModule.setAnimCallback(anim, callbackFunction, functionParams);
            anim.play();
        }

        /*
        Collects the current configuration selected to be sent as the simulation parameters
        */
        this.collectConfig = function() {
            var params = new Object();
            var nodes = [];
            var node;
            var connections = [];
            var connection = {
                sourceID: -1,
                targetID: -1,
                heuristic: -1,
                distance: -1
            }
            
            SimulationInterface.cy.nodes().each(function(element) {
                connections = []
                element.connectedEdges().each(function(edge){
                    connection = {
                        source: edge.data('sourceID'),
                        target: edge.data('targetID'),
                        distance: edge.data('distance')
                    }
                    connections.push(connection);
                })
                node = {
                    id: element.data('simulationID'),
                    name: element.data('id'),
                    heuristic: element.data('heuristic'),
                    connections: connections
                };
                nodes.push(node)
            });

            params.startID = $('#start-id').text();
            params.goalID = $('#goal-id').text();
            params.nodes = nodes;
            return params;
        }
    }

    // Give the simulation interface an instance of the module
    SimulationInterface.availableModules.AStar = {};
    SimulationInterface.availableModules.AStar.configuration = new AStarConfigurationModule();
})();