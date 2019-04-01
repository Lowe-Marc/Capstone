(function() {
    // Generic toolbar module constructor
    function genericToolbarModule() {
        // self is used in scenarios where the programmer is trying to reference this module, but is in a callback function
        var self = this;

        this.simulationConfigBottomBorder = function() {
            var bordercss = $('#simulation-config').css('border-bottom');
            return bordercss.split("px")[0]
        }

        this.enableToolbar = function() {

            // Run a simulation
            $('#simulate').click(function () {
                SimulationInterface.runSimulation();
            });

            // Set functionality to enter fullscreen mode
            $('#fullscreen-enter').click(function () {
                self.toggleFullscreen();
            });
    
            // Set functionality to exit from fullscreen mode
            $('#fullscreen-exit').click(function () {
                self.closeFullscreen();
            });
    
            /*
            When the sidebar is clicked, the cy display must be resized or 
            it doesn't register click locations correctly
            */
            $('#sidenavToggler').click(function () {
                SimulationInterface.cy.resize();
            });
            
            // Set functionality to lock node positions
            $('#lock-locked').click(function () {
                SimulationInterface.configurationModule.unlockNodes();
            });
    
            // Set functionality to unlock node positions
            $('#lock-unlocked').click(function () {
                SimulationInterface.configurationModule.lockNodes();
            });
    
            // Set functionality to save configurations in cookies
            $('#save-config').click(function () {
                self.saveConfigurationPrompt();
            });
    
            // Set functionality to disable node grid snapping when moved
            $('#disable-grid-snapping').click(function () {
                self.disableGridSnapping();
            });
    
            // Set functionality to enable node grid snapping when moved
            $('#enable-grid-snapping').click(function () {
                self.enableGridSnapping();
            });
        }

        /*
        Toggling fullscreen mode has some quirks across browsers and when working with cy.
        Need to manually save off original and fullscreen sizes,
        because cy will not dynamically adjust sizes
        */
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

        /*
        Need to once again handle browser specific and cy issues
        */
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

        /*
        Small configuration details for how grid snapping handles
        */
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
        
        /*
        Small configuration details for how removing grid snapping handles
        */
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

        /*
        Note that the save-config-modal is in the AStar View, and must be included or accessible in whatever 
        view is currently being displayed for this to work
        */
        this.saveConfigurationPrompt = function() {
            $('#save-config-modal').show();
        }
    }

    // Give interface a handle to the generic toolbar module constructor
    SimulationInterface.genericConstructors.toolbar = genericToolbarModule;
})();