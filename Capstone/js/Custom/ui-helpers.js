
function setAStarConfig() {
    // $('#simulation-config-overlay').load('..\\Views\\Configurations\\AStarConfiguration.cshtml')
    var content = '<div> Start: <label id="start-label"></label><label id="start-id" style="display:none">-1</label></div>';
    content += '<div> Goal: <label id="goal-label"></label><label id="goal-id" style="display:none">-1<label></div>';
    $('#simulation-config').html(content)
}

function simulationConfigBottomBorder() {
    var bordercss = $('#simulation-config').css('border-bottom');
    return bordercss.split("px")[0]
}

// Note that the keys in params must match the names used in Simulations/AStar
function collectAStarParams(cy) {
    console.log("collecting parameters")
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
    // Look through the nodes, for each one assemble a list of edges
    // that connect to them
    cy.nodes().each(function(element) {
        connections = []
        element.connectedEdges().each(function(edge){
            connection = {
                source: edge.data('sourceID'),
                target: edge.data('targetID'),
                heuristic: edge.data('heuristic'),
                distance: edge.data('distance')
            }
            connections.push(connection);
        })
        node = {
            id: element.data('simulationID'),
            connections: connections
        };
        nodes.push(node)
    });

    params.startID = $('#start-id').text();
    params.goalID = $('#goal-id').text();
    params.nodes = nodes;
    return params;
}