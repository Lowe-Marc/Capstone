(function() {

    function DPConfigurationModule() {
        SimulationInterface.genericConstructors.configuration.call(this);

        this.nodeColor = function(cellType) {
            if (cellType == 0) {
                return 'silver';
            } else if (cellType == 1) {
                return 'black';
            } else {
                return 'blue';
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
    }

    // Give the simulation interface an instance of the module
    SimulationInterface.availableModules.DynamicProgramming = {};
    SimulationInterface.availableModules.DynamicProgramming.configuration = new DPConfigurationModule();
})();