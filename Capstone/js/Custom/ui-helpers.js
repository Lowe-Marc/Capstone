
function setAStarConfig() {
    // $('#simulation-config-overlay').load('..\\Views\\Configurations\\AStarConfiguration.cshtml')
    var content = '<div> Start: <label id="start-label"></label><label id="start-id" style="display:none">-1</label></div>';
    content += '<div> Goal: <label id="goal-label"></label><label id="goal-id" style="display:none">-1<label></div>';
    content += '<div><label id="priority-queue-label"><u>Priority Queue</u></label></div>';
    content += '<div id="priority-queue-div"></div>';
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

    var newConfig = jQuery.extend(true, {}, currentConfig)
    newConfig.name = configName;

    console.log("currentConfig:", currentConfig)
    console.log("JSON.stringify:")
    console.log(JSON.stringify(currentConfig));

    // $.ajax({
    //     method: "POST",
    //     url: "/Simulations/SaveAStarConfiguration",
    //     data: { "data": JSON.stringify(currentConfig) },
    //     dataType: "json",
    //     success: (result) => {
    //         console.log("Successful save");
    //         console.log("results:", result)
    //     },
    //     error: (result) => {
    //         if (result.responseText == "True") {
    //             console.log("Pseudo-Successful save");
    //             console.log("results:", result);
    //         } else {
    //             console.log("Unsuccessful save");
    //             console.log("results:", result);
    //         }
    //     }
    // });

    if (getCookie(configName) == "") {
        setCookie(configName, newConfig, 180);
    }

    setConfigurationsInSelector(configs, [])

    $('#save-config-modal').hide();
}

function checkConfigName() {
    var configName = $('#configuration-name').val();

    if (getCookie(configName) != "") {
        $('#saveConfigButton').disable();
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
