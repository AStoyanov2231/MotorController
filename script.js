$(document).ready(function() {
    $('.ui.dropdown').dropdown();

    const operationModeConfig = {
        'speed': {
            trajectorySpeed: false,
            trajectoryPosition: false,
            trajectoryRamp: false,
            showRampFields: false
        },
        'position': {
            trajectorySpeed: false,
            trajectoryPosition: false,
            trajectoryRamp: false,
            showRampFields: false
        },
        'manual-speed': {
            trajectorySpeed: true,
            trajectoryPosition: false,
            trajectoryRamp: true,
            showRampFields: true
        },
        'manual-position': {
            trajectorySpeed: true,
            trajectoryPosition: true,
            trajectoryRamp: true,
            showRampFields: false
        }
    };

    function updateTrajectoryControls(mode) {
        const config = operationModeConfig[mode];
        
        // Trajectory Control header
        const trajectoryHeader = $('h3.ui.header:contains("Trajectory Control")');
        const trajectoryForm = trajectoryHeader.next('.ui.form');
        
        // Show/hide the entire trajectory section based on whether any trajectory controls are used
        if (config.trajectorySpeed || config.trajectoryPosition) {
            trajectoryHeader.show();
            trajectoryForm.show();
        } else {
            trajectoryHeader.hide();
            trajectoryForm.hide();
        }
        
        // Speed trajectory control
        const speedField = $('.field:contains("Speed"):not(:contains("Operation"))');
        const speedInput = speedField.find('input[type="number"]');
        const speedButton = speedInput.next('button');
        speedInput.prop('disabled', !config.trajectorySpeed);
        speedButton.prop('disabled', !config.trajectorySpeed);
        if (config.trajectorySpeed) {
            speedField.show();
        } else {
            speedField.hide();
        }
        
        // Position trajectory control
        const positionField = $('.field:contains("Position"):not(:contains("Operation"))');
        const positionInput = positionField.find('input[type="number"]');
        const positionButton = positionInput.next('button');
        positionInput.prop('disabled', !config.trajectoryPosition);
        positionButton.prop('disabled', !config.trajectoryPosition);
        if (config.trajectoryPosition) {
            positionField.show();
        } else {
            positionField.hide();
        }
        
        // Ramp execution button
        const rampButton = $('#execute-ramp');
        rampButton.prop('disabled', !(config.trajectorySpeed || config.trajectoryPosition));
        if (config.trajectorySpeed || config.trajectoryPosition) {
            rampButton.parent().show();
        } else {
            rampButton.parent().hide();
        }

        // Ramp-related time fields
        const rampFields = [
            $('.field:contains("Ramp Up Time")'),
            $('.field:contains("Ramp Plato Time")'),
            $('.field:contains("Ramp Down Time")')
        ];

        rampFields.forEach(field => {
            field.find('input').prop('disabled', !config.showRampFields);
            if (config.showRampFields) {
                field.show();
            } else {
                field.hide();
            }
        });
    }

    $('#operation-mode').on('change', function() {
        const selectedMode = $(this).val();
        updateTrajectoryControls(selectedMode);
    });

    updateTrajectoryControls($('#operation-mode').val());
});