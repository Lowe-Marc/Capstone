
function setAStarConfig() {
    // $('#simulation-config-overlay').load('..\\Views\\Configurations\\AStarConfiguration.cshtml')
    var content = '<div> Start: <label id="start-label">Start<label></div>';
    content += '<div> Goal: <label id="start-label">Goal<label></div>';
    $('#simulation-config').html(content)
}

function simulationConfigBottomBorder() {
    var bordercss = $('#simulation-config').css('border-bottom');
    return bordercss.split("px")[0]
}

function qtipContent() {
    // var content = '<div> Start: <button id="start-button">Start<button></div>';
    // content += '<div> Goal: <button id="start-button">Goal<button></div>';
    var cont = {
        content:{
            text: "something"
        }, 
        prerender: false,
        overwrite: true,
        position: {
            my: 'top center',
            at: 'bottom center',
        },
        style: {
            // classes: 'qtip-bootstrap',
            tip: { width: 16, height: 8 },
        },
        show: {
            solo: true,
        },
    }
    return cont;
}

function popOver(element, cy) {
    console.log("element", element)
    console.log("element.id()", element.id())
    // console.log("element", cy.elements("node[id= '" + element.id() + "']"))
    // element.qtip();
    // cy.elements("node[id= '" + element.id() + "']").qtip();
    // cy.elements("node[id= 'Mineapolis']").qtip(qtipContent());
    cy.elements("node[category= '2']").qtip(qtipContent());
    // cy.elements("node[category= '3']").qtip(qtipContent());
}