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

    function clearAllInputs() {
        // Clear all number inputs
        $('input[type="number"]').val('');
        
        // Reset dropdowns to their first option
        $('.ui.dropdown').dropdown('restore defaults');
        
        // Trigger the operation mode change to update UI
        const defaultMode = $('#operation-mode').val();
        updateTrajectoryControls(defaultMode);
    }

    function saveConfiguration() {
        // Get the current configuration values
        const configValues = getConfigValues();
        
        // Convert the configuration to a JSON string
        const jsonString = JSON.stringify(configValues, null, 2);
        
        // Create a blob with the JSON data
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'motor_configuration.json';
        
        // Append the link to the document, click it, and remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        URL.revokeObjectURL(link.href);
        
        // Log to console
        console.log('Saved Configuration:', jsonString);
    }

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

    function getConfigValues() {
        const mode = $('#operation-mode').val();
        const config = operationModeConfig[mode];
        
        // Create the complete JSON structure with default values
        const result = {
            "FileHeader": {
                "Name": "JSON",
                "Version": 0.9,
                "DataSize": 0,
                "MD5": 0
            },
            "FileBody": {
                "SysCfg": {
                    "Type": ["uint32", "uint8", "uint32", "uint32", "uint32"],
                    "Payload": {
                        "DataCycleNs": 0,
                        "FldWk.StrtVtgRt": 0,
                        "FldWk.Ki": 0,
                        "FldWk.Kp": 0,
                        "FldWk.Kd": 0
                    }
                },
                "MotorCfg": {
                    "Type": ["uint8", "uint32", "uint16", "uint16", "bool"],
                    "Payload": [
                        {
                            "MotorPolePairs": 0,
                            "MaxPhaseCurrAmp": 0,
                            "MinSpeedRpm": 0,
                            "MaxSpeedRpm": 0,
                            "InvMotorDir": false
                        }
                    ]
                },
                "EncCfg": {
                    "Type": ["char*", "uint16", "uint32", "bool"],
                    "Payload": {
                        "EncLineDriver": "",
                        "EncNumOfPulses": 0,
                        "EncFactor": 0,
                        "InvEncDir": false
                    }
                },
                "HalCfg": {
                    "Type": ["uint32", "uint8", "uint8", "uint16", "uint16", "uint16", "uint32", "uint32", "uint32"],
                    "Payload": {
                        "RqstVdVector": 0,
                        "SamplingSpeedRpm": 0,
                        "NumOfPolePairsRot": 0,
                        "MaxDeviationAngleDig": 0,
                        "WaitTimeBetweenEachSample": 0,
                        "WaitTimeAfterAlignment": 0,
                        "Ki": 0,
                        "Kp": 0,
                        "Kd": 0
                    }
                },
                "AppCfg": {
                    "Type": ["char*", "uint32", "uint32", "uint32", "uint32"],
                    "Payload": {
                        "OpMode": mode,
                        "DataCycleNs": 0,
                        "RampUpRt": 0,
                        "RampDwnRt": 0,
                        "QuickStopRt": 0
                    }
                },
                "CalibrationParams": {
                    "Type": ["uint32", "uint32", "uint32"],
                    "Payload": [
                        {
                            "Ki": 0,
                            "Kp": 0,
                            "Kd": 0
                        },
                        {
                            "Ki": 0,
                            "Kp": 0,
                            "Kd": 0
                        },
                        {
                            "Ki": 0,
                            "Kp": 0,
                            "Kd": 0
                        }
                    ]
                },
                "SpdStart": {
                    "Type": ["uint32"],
                    "Payload": {
                        "Rpm": 0
                    }
                }
            }
        };

        // Update values based on the current mode and available fields
        if (config.trajectorySpeed) {
            const speedValue = parseFloat($('.field:contains("Speed"):not(:contains("Operation")) input[type="number"]').val()) || 0;
            result.FileBody.SpdStart.Payload.Rpm = speedValue;

            // Only set DataCycleNs and QuickStopRt when speed control is active
            const dataCycleValue = parseFloat($('.field:contains("DataCycleNs") input').val()) || 0;
            const quickStopValue = parseFloat($('.field:contains("QuickStopRt") input').val()) || 0;
            result.FileBody.AppCfg.Payload.DataCycleNs = dataCycleValue || 0;
            result.FileBody.AppCfg.Payload.QuickStopRt = quickStopValue || 0;
        }

        // Add position configuration if available
        if (config.trajectoryPosition) {
            const positionValue = parseFloat($('.field:contains("Position"):not(:contains("Operation")) input[type="number"]').val()) || 0;
            // Since position wasn't in the original structure, we'll add it to AppCfg
            result.FileBody.AppCfg.Payload.Position = positionValue;
        }

        // Update ramp configuration if available
        if (config.showRampFields) {
            result.FileBody.AppCfg.Payload.RampUpRt = parseFloat($('.field:contains("Ramp Up Time") input').val()) || 0;
            result.FileBody.AppCfg.Payload.RampDwnRt = parseFloat($('.field:contains("Ramp Down Time") input').val()) || 0;
            
            // Store plato time in AppCfg
            const platoTime = parseFloat($('.field:contains("Ramp Plato Time") input').val()) || 0;
            result.FileBody.AppCfg.Payload.PlatoTime = platoTime;
        }

        // Calculate DataSize based on the complete FileBody
        result.FileHeader.DataSize = JSON.stringify(result.FileBody).length;

        return result;
    }

    // Add click handler for apply config button
    $('#apply-config').on('click', function() {
        const configValues = getConfigValues();
        console.log('Current Configuration:', JSON.stringify(configValues, null, 2));
    });

    // Add click handler for restore to default button
    $('#restore-default').on('click', function() {
        clearAllInputs();
        const configValues = getConfigValues();
        console.log('Restored Default Configuration:', JSON.stringify(configValues, null, 2));
    });

    // Add click handler for save all button
    $('#save-all').on('click', saveConfiguration);

    $('#operation-mode').on('change', function() {
        const selectedMode = $(this).val();
        updateTrajectoryControls(selectedMode);
    });

    updateTrajectoryControls($('#operation-mode').val());
});