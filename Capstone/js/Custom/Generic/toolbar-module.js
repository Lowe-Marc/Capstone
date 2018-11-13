(function() {

    function genericToolbarModule() {
        var self = this;

        this.simulationConfigBottomBorder = function() {
            var bordercss = $('#simulation-config').css('border-bottom');
            return bordercss.split("px")[0]
        }

        this.enableToolbar = function() {
            self.setConfig();

            // Run a simulation
            $('#simulate').click(function () {
                SimulationInterface.runSimulation();
            });

            $('#fullscreen-enter').click(function () {
                self.toggleFullscreen();
            });
    
            $('#fullscreen-exit').click(function () {
                self.closeFullscreen();
            });
    
            $('#sidenavToggler').click(function () {
                SimulationInterface.cy.resize();
            });
    
            $('#lock-locked').click(function () {
                SimulationInterface.configurationModule.unlockNodes();
            });
    
            $('#lock-unlocked').click(function () {
                SimulationInterface.configurationModule.lockNodes();
            });
    
            $('#save-config').click(function () {
                self.saveConfigurationPrompt();
            });
    
            $('#disable-grid-snapping').click(function () {
                self.disableGridSnapping();
            });
    
            $('#enable-grid-snapping').click(function () {
                self.enableGridSnapping();
            });
        }

        // Need to manually save off original and fullscreen sizes,
        // because cy will not dynamically adjust sizes
        this.toggleFullscreen = function() {
            var section = document.getElementById('simulation-area');
            SimulationInterface.cy.originalWidth = SimulationInterface.cy.size()['width'];
            SimulationInterface.cy.originalHeight = SimulationInterface.cy.size()['height'];
            if (section.requestFullscreen) {
                section.requestFullscreen();
            } else if (section.mozRequestFullScreen) { /* Firefox */
                section.mozRequestFullScreen();
            } else if (section.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
                section.webkitRequestFullscreen();
            } else if (section.msRequestFullscreen) { /* IE/Edge */
                section.msRequestFullscreen();
            }
            $('#fullscreen-enter').hide();
            $('#fullscreen-exit').show();
            if (SimulationInterface.cy.fullscreenHeight != undefined) {
                $('#cy').css('height', SimulationInterface.cy.fullscreenHeight);
                $('#cy').css('width', SimulationInterface.cy.fullscreenWidth);
            }
            
            SimulationInterface.cy.resize();
        }

        this.closeFullscreen = function() {
            SimulationInterface.cy.fullscreenWidth = SimulationInterface.cy.size()['width'];
            SimulationInterface.cy.fullscreenHeight = SimulationInterface.cy.size()['height'];
            if (document.exitFullscreen) {
            document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
            document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
            }
            $('#fullscreen-enter').show();
            $('#fullscreen-exit').hide();
            $('#cy').css('height', SimulationInterface.cy.originalHeight);
            $('#cy').css('width', SimulationInterface.cy.originalWidth);
            SimulationInterface.cy.resize();
        }

        this.enableGridSnapping = function() {
            SimulationInterface.cy.gridGuide({
                // On/Off Modules
                /* From the following four snap options, at most one should be true at a given time */
                snapToGridOnRelease: false, // Snap to grid on release
                snapToGridDuringDrag: true, // Snap to grid during drag
                snapToAlignmentLocationOnRelease: false, // Snap to alignment location on release
                snapToAlignmentLocationDuringDrag: false, // Snap to alignment location during drag
                drawGrid: true, // Draw grid background
            })
            $('#disable-grid-snapping').show();
            $('#enable-grid-snapping').hide();
        }
        
        this.disableGridSnapping = function() {
            SimulationInterface.cy.gridGuide({
                // On/Off Modules
                /* From the following four snap options, at most one should be true at a given time */
                snapToGridOnRelease: false, // Snap to grid on release
                snapToGridDuringDrag: false, // Snap to grid during drag
                snapToAlignmentLocationOnRelease: false, // Snap to alignment location on release
                snapToAlignmentLocationDuringDrag: false, // Snap to alignment location during drag
                drawGrid: false, // Draw grid background
            })
            $('#disable-grid-snapping').hide();
            $('#enable-grid-snapping').show();
        }
    }

    // Give interface a handle to the generic toolbar module constructor
    SimulationInterface.genericConstructors.toolbar = genericToolbarModule;
})();