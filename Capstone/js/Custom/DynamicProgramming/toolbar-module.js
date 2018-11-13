(function() {

    function DPToolbarModule() {
        SimulationInterface.genericConstructors.toolbar.call(this);

        this.setConfig = function() {
            var currentConfig = SimulationInterface.configurationModule.currentConfig;
            var numNodes = currentConfig.nodes.length;
            var i = 0, currentRow = 0, currentCol = 0;
            var content = '';
            content += '<div class="notation pull-right dp-config-div">'
            content += '<table class="table">'
            content += '<tr>'
            for (i = 0; i < numNodes; i++) {
                if (currentConfig.nodes[i].coords.Item2 > currentRow) {
                    currentCol = 0
                    currentRow++;
                    content += '</tr>'
                    content += '<tr>'
                }
                content += '<td>' + currentCol + '</td>'
                currentCol++;
            }
            content += '</tr>'
            content += '</table>'
            content += '</div>'
            $('#simulation-config').html(content)
            $('#simulation-config').show();
            // $('#simulation-config').height($('#simulation-display').height() - this.simulationConfigBottomBorder());
            $('#simulation-config').height(600 - this.simulationConfigBottomBorder());
        }
    }

    // Give the simulation interface an instance of the module
    SimulationInterface.availableModules.DynamicProgramming.toolbar = new DPToolbarModule();
})();