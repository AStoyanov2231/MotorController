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
                body: JSON.stringify({ command, payload })
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
        const speed = parseFloat($('.field:contains("Speed"):not(:contains("Operation")) input[type="text"]').val()) || 0;
        const position = parseFloat($('.field:contains("Position"):not(:contains("Operation")) input[type="text"]').val()) || 0;
        const dataCycle = parseFloat($('.field:contains("Data Cycle Period") input').val()) || 0;
        const quickStop = parseFloat($('.field:contains("Quick Stop Time") input').val()) || 0;
        const rampUp = parseFloat($('.field:contains("Ramp Up Time") input').val()) || 0;
        const rampDown = parseFloat($('.field:contains("Ramp Down Time") input').val()) || 0;
        const rampPlato = parseFloat($('.field:contains("Ramp Plato Time") input').val()) || 0;

        currentConfig.FileBody.AppCfg.Payload.OpMode = mode;
        currentConfig.FileBody.SpdStart.Payload.Rpm = speed;
        currentConfig.FileBody.AppCfg.Payload.Position = position;
        currentConfig.FileBody.AppCfg.Payload.DataCycleNs = dataCycle;
        currentConfig.FileBody.AppCfg.Payload.QuickStopRt = quickStop;
        currentConfig.FileBody.AppCfg.Payload.RampUpRt = rampUp;
        currentConfig.FileBody.AppCfg.Payload.RampDwnRt = rampDown;
        currentConfig.FileBody.AppCfg.Payload.PlatoTime = rampPlato;

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

        const rampButton = $('#execute-ramp');
        if (config.trajectoryRamp) {
            rampButton.show().prop('disabled', false);
        } else {
            rampButton.hide().prop('disabled', true);
        }
    }
    
    $('#apply-config').off('click').on('click', async function() {
        const configJson = {
            AppCfg: {
                Type: ["char*", "uint32", "uint32", "uint32", "uint32"],
                Payload: {
                    OpMode: "Spd",
                    DataCycleNs: 1000000,
                    RampUpRt: 1000,
                    RampDwnRt: 1000,
                    QuickStopRt: 100
                }
            }
        };
        await sendCommand('applyCfg', configJson);
        configApplied = true;
    });

    $('#apply-pids').off('click').on('click', async function() {
        updateConfig();
        await sendCommand('applyCfg', { pids: currentConfig.FileBody.CalibrationParams });
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

    // Update Speed Set and Stop button handlers
    $('.field:contains("Speed") button:contains("Set")').off('click').on('click', function() {
        const speed = parseFloat($(this).closest('.field').find('input[type="text"]').val());
        if (!isNaN(speed)) {
            const spdJson = {
                SpdStart: {
                    Type: ["uint32"],
                    Payload: {
                        Val: speed
                    }
                }
            };
            sendCommand('cmd', spdJson);
        }
    });

    $('.field:contains("Speed") button:contains("Stop")').off('click').on('click', function() {
        const stopJson = {
            SpdStop: {
                Type: ["uint32"],
                Payload: {}
            }
        };
        sendCommand('cmd', stopJson);
    });

    // Update Position Set and Stop button handlers
    $('.field:contains("Position") button:contains("Set")').off('click').on('click', function() {
        const position = parseFloat($(this).closest('.field').find('input[type="text"]').val());
        if (!isNaN(position)) {
            const posJson = {
                PosStart: {
                    Type: ["uint32"],
                    Payload: {
                        Val: position
                    }
                }
            };
            sendCommand('cmd', posJson);
        }
    });

    $('.field:contains("Position") button:contains("Stop")').off('click').on('click', function() {
        const stopJson = {
            PosStop: {
                Type: ["uint32"],
                Payload: {}
            }
        };
        sendCommand('cmd', stopJson);
    });

    $('#execute-ramp').off('click').on('click', function() {
        const rampJson = {
            RampStart: {
                Type: ["uint32"],
                Payload: {
                    Time: 1000
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

    updateFieldVisibility($('#operation-mode').val());

    window.currentConfig = currentConfig;
});