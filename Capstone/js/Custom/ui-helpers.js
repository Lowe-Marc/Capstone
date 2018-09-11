
function configurationOverlayOn() {
    document.getElementById("simulation-config-overlay").style.display = "block";
}

function configurationOverlayOff() {
    document.getElementById("simulation-config-overlay").style.display = "none";
}

function setAStarConfig() {
    // $('#simulation-config-overlay').load('..\\Views\\Configurations\\AStarConfiguration.cshtml')
    var content = '<div> Start: </div>';
    content += '<div> Goal: </div>';
    $('#simulation-config-overlay').text('test')
}