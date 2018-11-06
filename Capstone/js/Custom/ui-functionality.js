var UIHandler = {
    setConfig: function() {
        switch (AnimationHandler.currentSimulation) {
            case "AStar":
                UIHandler.setAStarConfig();
                break;
            case "DynamicProgramming":
                UIHandler.setDynamicProgrammingConfig();
                break;
            case "ReinforcementLearning":
                UIHandler.setReinforcementLearningConfig();
                break;
            default:
                console.log("Config side bar has failed to detect the current simulation (", AnimationHandler.currentSimulation, ")")
                break;
        }
    },

    saveConfigurationPrompt: function() {
        $('#save-config-modal').show();
    },

    enableToolbar: function() {
        $('#fullscreen-enter').click(function () {
            UIHandler.toggleFullscreen();
        });

        $('#fullscreen-exit').click(function () {
            UIHandler.closeFullscreen();
        });

        $('#sidenavToggler').click(function () {
            AnimationHandler.cy.resize();
        });

        $('#lock-locked').click(function () {
            UIHandler.unlockNodes();
        });

        $('#lock-unlocked').click(function () {
            UIHandler.lockNodes();
        });

        $('#save-config').click(function () {
            UIHandler.saveConfigurationPrompt();
        });

        $('#disable-grid-snapping').click(function () {
            UIHandler.disableGridSnapping();
        });

        $('#enable-grid-snapping').click(function () {
            UIHandler.enableGridSnapping();
        });
    },

    setAStarConfig: function() {
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
    },

    setDynamicProgrammingConfig: function() {
        var content = '';
        content += '<div class="notation pull-right">'
        content += '</div>'
        $('#simulation-config').html(content)
        $('#simulation-config').show();
        $('#simulation-config').height($('#simulation-display').height() - simulationConfigBottomBorder());
    },

    setReinforcementLearningConfig: function() {

    },

    // Need to manually save off original and fullscreen sizes,
    // because cy will not dynamically adjust sizes
    toggleFullscreen: function() {
        var section = document.getElementById('simulation-area');
        AnimationHandler.cy.originalWidth = cy.size()['width'];
        AnimationHandler.cy.originalHeight = cy.size()['height'];
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
        if (AnimationHandler.cy.fullscreenHeight != undefined) {
            $('#cy').css('height', AnimationHandler.cy.fullscreenHeight);
            $('#cy').css('width', AnimationHandler.cy.fullscreenWidth);
        }
        
        AnimationHandler.cy.resize();
    },

    closeFullscreen: function() {
        AnimationHandler.cy.fullscreenWidth = cy.size()['width'];
        AnimationHandler.cy.fullscreenHeight = cy.size()['height'];
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
        $('#cy').css('height', AnimationHandler.cy.originalHeight);
        $('#cy').css('width', AnimationHandler.cy.originalWidth);
        AnimationHandler.cy.resize();
    },

    lockNodes: function() {
        AnimationHandler.cy.nodes().lock();
        $('#lock-locked').show();
        $('#lock-unlocked').hide();
    },
    
    unlockNodes: function() {
        AnimationHandler.cy.nodes().unlock();    
        $('#lock-locked').hide();
        $('#lock-unlocked').show();
    },

    enableGridSnapping: function() {
        AnimationHandler.cy.gridGuide({
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
    },
    
    disableGridSnapping: function() {
        AnimationHandler.cy.gridGuide({
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

};
