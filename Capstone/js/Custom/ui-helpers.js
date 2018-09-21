
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
function collectAStarParams() {
    var params = new Object();
    params.startID = $('#start-id').text();
    params.goalID = $('#goal-id').text();
    // params = {
    //     startID: $('#start-id').text(),
    //     goalID: $('#goal-id').text()
    // }
    return params;
}