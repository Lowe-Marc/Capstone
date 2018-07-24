function setCytoscape(currentConfig) {
    buildElementStructure(currentConfig);

    // TODO: positions
    // find the center point and offset all the points so the center is at 0,0
    var cy = cytoscape({
        container: document.getElementById('cy'),
        style: [
            {
                selector: 'node',
                style: {
                    shape: 'hexagon',
                    'background-color': 'red',
                    label: 'data(id)'
                }
            }],
        layout: {
            name: 'preset'
        },
        elements: elements,
        zoom: 1,
        pan: { x: 0, y: 0 },
        minZoom: 1e-1,
        maxZoom: 1,
        wheelSensitivity: 0.2
    });

    cy.ready(function () {
        cy.nodes().positions(function (ele, i) {
            return {
                x: positionsArr[i].x,
                y: positionsArr[i].y
            }
        });
    });

    cy.on('tap', 'node', function (evt) {
        var node = evt.target;
        console.log("tap", node.id(), node.position());
    });
}

function buildElementStructure(currentConfig) {
    elements = [];
    positionsArr = [];

    for (var i = 0; i < currentConfig.nodes.length; i++) {
        var x = (2) * (180 + currentConfig.nodes[i].x);
        var y = (2) * (90 - currentConfig.nodes[i].y);
        elements.push({
            data: {
                id: currentConfig.nodes[i].id,
                position: {
                    x: currentConfig.nodes[i].x,
                    y: currentConfig.nodes[i].y
                }
            }
        })
        positionsArr.push({
            x: currentConfig.nodes[i].x,
            y: currentConfig.nodes[i].y
        })
    }

    for (var i = 0; i < currentConfig.edges.length; i++) {
        elements.push({
            data: {
                id: currentConfig.edges[i].id,
                source: currentConfig.edges[i].source,
                target: currentConfig.edges[i].target
            }
        })
    }
}

function setConfigurationsInSelector(configs) {
    var configSelector = $('#configuration-selector');
    for (var i = 0; i < configs.length; i++) {
        configSelector.append($('<option></option>').val(i).html("Configuration " + i));
    }
    configSelector.on('change', function () {
        currentConfig = configs[this.value];
        setCytoscape(currentConfig);
    })
}
