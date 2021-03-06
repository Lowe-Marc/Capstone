
function setAStarConfig() {
    // $('#simulation-config-overlay').load('..\\Views\\Configurations\\AStarConfiguration.cshtml')

    var content = '';
    content += '<div class="notation pull-right">'
    content += '<ul class="list-inline list-unstyled">'
    content += '<li class="legend-item"><span class="active-label"></span>Active</li>'
    content += '<li class="legend-item"><span class="inconsistent-label"></span>Inconsistent</li>'
    content += '<li class="legend-item"><span class="inadmissible-label"></span>Inadmissible</li>'
    content += '<li class="legend-item"><span class="inadmissible-and-inconsistent-label"></span>Inconsistent & Inadmissible</li>'
    content += '<li> Start: <label id="start-label"></label><label id="start-id" style="display:none">-1</label></li>';
    content += '<li> Goal: <label id="goal-label"></label><label id="goal-id" style="display:none">-1<label></li>';
    content += '<li><label id="priority-queue-label"><u>Priority Queue</u></label></li>';
    content += '<li id="priority-queue-div"></li>';
    content += '</ul>'
    content += '</div>'
    $('#simulation-config').html(content)
    $('#simulation-config').show();
    $('#simulation-config').height($('#simulation-display').height() - simulationConfigBottomBorder());
}

function setAStarPriorityQueue() {
    var content = '<div><label id="priority-queue-label"><u>Priority Queue</u></label></div>';
    $('#simulation-specific-anim').html(content)
    $('#simulation-specific-anim').show();
    $('#simulation-specific-anim').height($('#simulation-display').height() - simulationConfigBottomBorder());
}

function updateAStarPriorityQueue(priorityQueue, cy) {
    var content = '';
    var queueLength = priorityQueue.length;
    var displayLimit = 10;
    queueLength = priorityQueue.length > displayLimit ? displayLimit : priorityQueue.length;
    for (var i = 0; i < queueLength; i++) {
        content += priorityQueue[i].name.replace('_', ' ') + ': ' + priorityQueue[i].f + '<br>';
    }
    if (queueLength == displayLimit) {
        content += '...<br>'
    }
    
    $('#priority-queue-div').html(content);
}

function clearAStarPriorityQueue() {
    $('#priority-queue-div').html('');
}

function simulationConfigBottomBorder() {
    var bordercss = $('#simulation-config').css('border-bottom');
    return bordercss.split("px")[0]
}

// Note that the keys in params must match the names used in Simulations/AStar
function collectAStarParams(deprecated) {
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

function saveAStarConfigurationPrompt() {
    $('#save-config-modal').show();
}

function requestAStarConfigurationSave() {
    var configName = $('#configuration-name').val();
    var newConfig = jQuery.extend(true, {}, currentConfig) // Deep copy of currentConfig
    newConfig.name = configName;
    updatePositions(newConfig);

    // Store the new config if it doesn't already exist
    if (getCookie(configName) == "") {
        setCookie(configName, newConfig, 180);
    }

    setConfigurationsInSelector()
    $('#save-config-modal').hide();
}

function checkConfigName() {
    var configName = $('#configuration-name').val();

    if (getCookie(configName) != "") {
        $('#saveConfigButton').disable();
    }
}

// Make sure the saved confg has the current positions as they are in the map
function updatePositions(config) {
    var configNode, cyNode;
    for(var i = 0; i < config.nodes.length; i++) {
        configNode = config.nodes[i];
        cyNode = cy.$('#' + configNode.id.replace(' ', '_'))[0];
        configNode.x = cyNode.position().x
        configNode.y = cyNode.position().y
    }
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + JSON.stringify(cvalue) + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie() {
    var username = getCookie("username");
    if (username != "") {
        alert("Welcome again " + username);
    } else {
        username = prompt("Please enter your name:", "");
        if (username != "" && username != null) {
            setCookie("username", username, 365);
        }
    }
}


function setAStarLegend() {
    var legendHTML = '';
    legendHTML += '<div class="notation pull-right">'
    legendHTML += '<ul class="list-inline list-unstyled">'
    legendHTML += '<li class="legend-item"><span class="active-label"></span>Active</li>'
    legendHTML += '<li class="legend-item"><span class="inconsistent-label"></span>Inconsistent</li>'
    legendHTML += '<li class="legend-item"><span class="inadmissible-label"></span>Inadmissible</li>'
    legendHTML += '<li class="legend-item"><span class="inadmissible-and-inconsistent-label"></span>Inconsistent & Inadmissible</li>'
    legendHTML += '</ul>'
    legendHTML += '</div>'
    $('#simulation-config').append(legendHTML)
}