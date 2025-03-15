$(document).ready(function() {
    $('.ui.dropdown').dropdown();
    const operationModeConfig = {
        'speed': {
            trajectorySpeed: false,
            trajectoryPosition: false,
            trajectoryRamp: false
        },
        'position': {
            trajectorySpeed: false,
            trajectoryPosition: false,
            trajectoryRamp: false
        },
        'manual-speed': {
            trajectorySpeed: true,
            trajectoryPosition: false,
            trajectoryRamp: true
        },
        'manual-position': {
            trajectorySpeed: true,
            trajectoryPosition: true,
            trajectoryRamp: false
        }
    };

    const defaultConfig = {
        FileHeader: {
            Name: "JSON",
            Version: 0.9,
            DataSize: 0,
            MD5: 0
        },
        FileBody: {
            SysCfg: {
                Type: ["uint32", "uint8", "uint32", "uint32", "uint32"],
                Payload: {
                    "DataCycleNs": 0,
                    "FldWk.StrtVtgRt": 0,
                    "FldWk.Ki": 0,
                    "FldWk.Kp": 0,
                    "FldWk.Kd": 0
                }
            },
            MotorCfg: {
                Type: ["uint8", "uint32", "uint16", "uint16", "bool"],
                Payload: [
                    {
                        MotorPolePairs: 0,
                        MaxPhaseCurrAmp: 0,
                        MinSpeedRpm: 0,
                        MaxSpeedRpm: 0,
                        InvMotorDir: false
                    }
                ]
            },
            EncCfg: {
                Type: ["char*", "uint16", "uint32", "bool"],
                Payload: {
                    EncLineDriver: "",
                    EncNumOfPulses: 0,
                    EncFactor: 0,
                    InvEncDir: false
                }
            },
            HalCfg: {
                Type: ["uint32", "uint8", "uint8", "uint16", "uint16", "uint16", "uint32", "uint32", "uint32"],
                Payload: {
                    RqstVdVector: 0,
                    SamplingSpeedRpm: 0,
                    NumOfPolePairsRot: 0,
                    MaxDeviationAngleDig: 0,
                    WaitTimeBetweenEachSample: 0,
                    WaitTimeAfterAlignment: 0,
                    Ki: 0,
                    Kp: 0,
                    Kd: 0
                }
            },
            AppCfg: {
                Type: ["char*", "uint32", "uint32", "uint32", "uint32"],
                Payload: {
                    OpMode: "speed",
                    DataCycleNs: 0,
                    RampUpRt: 0,
                    RampDwnRt: 0,
                    QuickStopRt: 0
                }
            },
            CalibrationParams: {
                Type: ["uint32", "uint32", "uint32"],
                Payload: [
                    {
                        Ki: 0,
                        Kp: 0,
                        Kd: 0
                    },
                    {
                        Ki: 0,
                        Kp: 0,
                        Kd: 0
                    },
                    {
                        Ki: 0,
                        Kp: 0,
                        Kd: 0
                    }
                ]
            },
            SpdStart: {
                Type: ["uint32"],
                Payload: {
                    Rpm: 0
                }
            }
        }
    };

    let currentConfig = JSON.parse(JSON.stringify(defaultConfig));
    let configApplied = false;
    let pidsApplied = false;

    async function sendCommand(command, payload) {
        try {
            console.log(`Sending ${command} with payload:`, JSON.stringify(payload, null, 2));
            const response = await fetch('http://127.0.0.1:3000/api/send-command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            console.log(`Response for ${command}:`, JSON.stringify(result, null, 2));
            return result;
        } catch (error) {
            console.error('Command failed:', error);
            return null;
        }
    }

    function updateConfig() {
        const mode = $('#operation-mode').val();
        const speed = parseFloat($('.field:contains("Speed"):not(:contains("Operation")) input[type="number"]').val()) || 0;
        const position = parseFloat($('.field:contains("Position"):not(:contains("Operation")) input[type="number"]').val()) || 0;
        const dataCycle = parseFloat($('.field:contains("Data Cycle Period") input[type="number"]').val()) || 0;
        const quickStop = parseFloat($('.field:contains("Quick Stop Time") input[type="number"]').val()) || 0;
        const rampUp = parseFloat($('.field:contains("Ramp Up Time") input[type="number"]').val()) || 0;
        const rampDown = parseFloat($('.field:contains("Ramp Down Time") input[type="number"]').val()) || 0;
        const rampPlato = parseFloat($('.field:contains("Ramp Plato Time") input[type="number"]').val()) || 0;

        currentConfig.FileBody.AppCfg.Payload.OpMode = mode;
        currentConfig.FileBody.SpdStart.Payload.Rpm = speed;
        currentConfig.FileBody.AppCfg.Payload.Position = position;
        currentConfig.FileBody.AppCfg.Payload.DataCycleNs = dataCycle;
        currentConfig.FileBody.AppCfg.Payload.QuickStopRt = quickStop;
        currentConfig.FileBody.AppCfg.Payload.RampUpRt = rampUp;
        currentConfig.FileBody.AppCfg.Payload.RampDwnRt = rampDown;
        currentConfig.FileBody.AppCfg.Payload.PlatoTime = rampPlato;

        // Add PID values update from input fields
        currentConfig.FileBody.CalibrationParams.Payload[0] = {
            Ki: parseFloat($('.speed-pid[data-pid="Ki"]').val()) || 100,
            Kp: parseFloat($('.speed-pid[data-pid="Kp"]').val()) || 100,
            Kd: parseFloat($('.speed-pid[data-pid="Kd"]').val()) || 100
        };

        currentConfig.FileBody.CalibrationParams.Payload[1] = {
            Ki: parseFloat($('.position-pid[data-pid="Ki"]').val()) || 100,
            Kp: parseFloat($('.position-pid[data-pid="Kp"]').val()) || 100,
            Kd: parseFloat($('.position-pid[data-pid="Kd"]').val()) || 100
        };

        currentConfig.FileBody.CalibrationParams.Payload[2] = {
            Ki: parseFloat($('.torque-pid[data-pid="Ki"]').val()) || 100,
            Kp: parseFloat($('.torque-pid[data-pid="Kp"]').val()) || 100,
            Kd: parseFloat($('.torque-pid[data-pid="Kd"]').val()) || 100
        };

        currentConfig.FileHeader.DataSize = JSON.stringify(currentConfig.FileBody).length;
        configApplied = false;
        pidsApplied = false;
    }

    function resetConfig() {
        currentConfig = JSON.parse(JSON.stringify(defaultConfig));
        $('input[type="number"], input[type="text"]').val('');
        $('#operation-mode').dropdown('set selected', 'speed');

        updateFieldVisibility('speed');
        
        configApplied = false;
        pidsApplied = false;
    }

    function updateFieldVisibility(mode) {
        const config = operationModeConfig[mode] || operationModeConfig['speed'];
        
        // Handle Trajectory Control section visibility
        const trajectoryHeader = $('h3.ui.header:contains("Trajectory Control")');
        const trajectoryForm = trajectoryHeader.next('.ui.form');
        
        if (config.trajectorySpeed || config.trajectoryPosition) {
            trajectoryHeader.show();
            trajectoryForm.show();
        } else {
            trajectoryHeader.hide();
            trajectoryForm.hide();
        }

        const speedField = $('.field:contains("Speed"):not(:contains("Operation"))').closest('.field');
        if (config.trajectorySpeed) {
            speedField.show();
            speedField.find('input').prop('disabled', false);
            speedField.find('button').prop('disabled', false);
            speedField.find('.ui.buttons button:contains("Set")').prop('disabled', false);
            speedField.find('.ui.buttons button:contains("Stop")').prop('disabled', false);
        } else {
            speedField.hide();
            speedField.find('input').prop('disabled', true);
            speedField.find('.ui.buttons button:contains("Set")').prop('disabled', true);
            speedField.find('.ui.buttons button:contains("Stop")').prop('disabled', true);
        }

        const positionField = $('.field:contains("Position"):not(:contains("Operation"))').closest('.field');
        if (config.trajectoryPosition) {
            positionField.show();
            positionField.find('input').prop('disabled', false);
            positionField.find('.ui.buttons button:contains("Set")').prop('disabled', false);
            positionField.find('.ui.buttons button:contains("Stop")').prop('disabled', false);
        } else {
            positionField.hide();
            positionField.find('input').prop('disabled', true);
            positionField.find('.ui.buttons button:contains("Set")').prop('disabled', true);
            positionField.find('.ui.buttons button:contains("Stop")').prop('disabled', true);
        }

        const rampTimeField = $('.field:contains("Ramp Time")').closest('.field');
        if (config.trajectoryRamp) {
            rampTimeField.show();
            rampTimeField.find('input').prop('disabled', false);
            rampTimeField.find('#execute-ramp').prop('disabled', false);
        } else {
            rampTimeField.hide();
            rampTimeField.find('input').prop('disabled', true);
            rampTimeField.find('#execute-ramp').prop('disabled', true);
        }

        const rampFields = [
            $('.field:contains("Ramp Up Time")'),
            $('.field:contains("Ramp Plato Time")'),
            $('.field:contains("Ramp Down Time")')
        ];

        rampFields.forEach(field => {
            if (config.trajectoryRamp) {
                field.show();
                field.find('input').prop('disabled', false);
            } else {
                field.hide();
                field.find('input').prop('disabled', true);
            }
        });

        // Execute Ramp button
        const rampButton = $('#execute-ramp');
        if (config.trajectoryRamp) {
            rampButton.show().prop('disabled', false);
        } else {
            rampButton.hide().prop('disabled', true);
        }
    }
    
    $('#apply-config').off('click').on('click', async function() {
        updateConfig();
        const configJson = {
            AppCfg: {
                Type: ["char*", "uint32", "uint32", "uint32", "uint32"],
                Payload: {
                    OpMode: currentConfig.FileBody.AppCfg.Payload.OpMode,
                    DataCycleNs: currentConfig.FileBody.AppCfg.Payload.DataCycleNs,
                    RampUpRt: currentConfig.FileBody.AppCfg.Payload.RampUpRt,
                    RampDwnRt: currentConfig.FileBody.AppCfg.Payload.RampDwnRt,
                    QuickStopRt: currentConfig.FileBody.AppCfg.Payload.QuickStopRt
                }
            }
        };
        await sendCommand('applyCfg', configJson);
        configApplied = true;
    });

    $('#apply-pids').off('click').on('click', async function() {
        updateConfig();
        const pidsJson = {
            PidPrms: {
                Type: ["float", "float", "float"],
                Payload: [
                    {
                        Ki: parseFloat($('.speed-pid[data-pid="Ki"]').val()) || 100,
                        Kp: parseFloat($('.speed-pid[data-pid="Kp"]').val()) || 100,
                        Kd: parseFloat($('.speed-pid[data-pid="Kd"]').val()) || 100
                    },
                    {
                        Ki: parseFloat($('.position-pid[data-pid="Ki"]').val()) || 100,
                        Kp: parseFloat($('.position-pid[data-pid="Kp"]').val()) || 100,
                        Kd: parseFloat($('.position-pid[data-pid="Kd"]').val()) || 100
                    },
                    {
                        Ki: parseFloat($('.torque-pid[data-pid="Ki"]').val()) || 100,
                        Kp: parseFloat($('.torque-pid[data-pid="Kp"]').val()) || 100,
                        Kd: parseFloat($('.torque-pid[data-pid="Kd"]').val()) || 100
                    }
                ]
            }
        };
        await sendCommand('applyCfg', pidsJson);
        pidsApplied = true;
    });

    $('#save-all').off('click').on('click', async function() {
        updateConfig();
        if (!configApplied) {
            await sendCommand('applyCfg', { configuration: currentConfig.FileBody });
        }
        
        const jsonString = JSON.stringify(currentConfig, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'motor_configuration.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    });

    $('#restore-default').off('click').on('click', function() {
        resetConfig();
    });

    $('.field:contains("Speed") button:contains("Set")').off('click').on('click', function() {
        const speed = parseFloat($(this).closest('.field').find('input[type="number"]').val());
        if (!isNaN(speed)) {
            const spdJson = {
                SpdStart: {
                    Type: ["uint32"],
                    Payload: {
                        Val: speed
                    }
                }
            };
            sendCommand('Spd', spdJson);
        }
    });

    $('.field:contains("Speed") button:contains("Stop")').off('click').on('click', function() {
        sendCommand('StopSpd', null);
    });
    
    $('.field:contains("Position") button:contains("Set")').off('click').on('click', function() {
        const position = parseFloat($(this).closest('.field').find('input[type="number"]').val());
        if (!isNaN(position)) {
            const posJson = {
                PosStart: {
                    Type: ["uint32"],
                    Payload: {
                        Val: position
                    }
                }
            };
            sendCommand('Pos', posJson);
        }
    });

    $('.field:contains("Position") button:contains("Stop")').off('click').on('click', function() {
        sendCommand('StopPos', null);
    });

    $('#execute-ramp').off('click').on('click', function() {
        updateConfig();
        const rampJson = {
            RampStart: {
                Type: ["uint32"],
                Payload: {
                    Time: currentConfig.FileBody.AppCfg.Payload.PlatoTime || 0
                }
            }
        };
        sendCommand('cmd', rampJson);
    });

    $('#operation-mode').off('change').on('change', function() {
        const selectedMode = $(this).val();
        currentConfig.FileBody.AppCfg.Payload.OpMode = selectedMode;
        updateFieldVisibility(selectedMode);
        configApplied = false;
    });

    // Initial visibility update
    updateFieldVisibility($('#operation-mode').val());

    // Make currentConfig globally accessible
    window.currentConfig = currentConfig;
});