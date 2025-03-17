import { API_BASE_URL, createEndpointPayload } from './API.js';

const motorConfigManager = window.motorConfigManager;

async function sendPostRequest(url, data) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

const operationModeStates = {
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

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dropdowns
    const dropdowns = document.querySelectorAll('.ui.dropdown');
    dropdowns.forEach(dropdown => {
        const input = dropdown.querySelector('input[type="hidden"]');
        const menu = dropdown.querySelector('.menu');
        const text = dropdown.querySelector('.text');

        dropdown.addEventListener('click', function() {
            this.classList.toggle('active');
            menu.classList.toggle('visible');
        });

        menu.querySelectorAll('.item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.stopPropagation();
                const value = this.getAttribute('data-value');
                const displayText = this.textContent;
                
                if (input) input.value = value;
                if (text) text.textContent = displayText;
                
                dropdown.classList.remove('active');
                menu.classList.remove('visible');

                if (dropdown.id === 'motor-select') {
                    handleMotorSelection(value);
                } else if (dropdown.id === 'operation-mode-select') {
                    handleOperationModeSelection(value);
                }
            });
        });

        document.addEventListener('click', function(e) {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
                menu.classList.remove('visible');
            }
        });
    });

    handleOperationModeSelection('speed');

    // Control Elements
    const speedInput = document.querySelector('.trajectory-input-group:nth-child(1) input');
    const speedSetButton = document.querySelector('.trajectory-input-group:nth-child(1) .primary.button');
    const speedStopButton = document.querySelector('.trajectory-input-group:nth-child(1) .button:not(.primary)');
    const positionInput = document.querySelector('.trajectory-input-group:nth-child(2) input');
    const positionSetButton = document.querySelector('.trajectory-input-group:nth-child(2) .primary.button');
    const positionStopButton = document.querySelector('.trajectory-input-group:nth-child(2) .button:not(.primary)');
    const rampInput = document.querySelector('.trajectory-input-group:nth-child(3) input');
    const rampSetButton = document.querySelector('.trajectory-input-group:nth-child(3) .primary.button');

    // Speed control
    speedSetButton.addEventListener('click', async () => {
        const speed = parseInt(speedInput.value);
        if (isNaN(speed)) {
            alert('Please enter a valid speed value');
            return;
        }
        try {
            await sendPostRequest(`${API_BASE_URL}/TrajControl/Speed/Start`, createEndpointPayload.START_SPEED(speed));
        } catch (error) {
            console.error('Failed to set motor speed:', error);
        }
    });

    speedStopButton.addEventListener('click', async () => {
        try {
            await sendPostRequest(`${API_BASE_URL}/TrajControl/Speed/Stop`, {});
        } catch (error) {
            console.error('Failed to stop motor:', error);
        }
    });

    // Position control
    positionSetButton.addEventListener('click', async () => {
        const position = parseInt(positionInput.value);
        if (isNaN(position)) {
            alert('Please enter a valid position value');
            return;
        }
        try {
            await sendPostRequest(`${API_BASE_URL}/TrajControl/Position/Start`, createEndpointPayload.START_POSITION(position));
        } catch (error) {
            console.error('Failed to set motor position:', error);
        }
    });

    positionStopButton.addEventListener('click', async () => {
        try {
            await sendPostRequest(`${API_BASE_URL}/TrajControl/Position/Stop`, {});
        } catch (error) {
            console.error('Failed to stop position control:', error);
        }
    });

    // Ramp control
    rampSetButton.addEventListener('click', async () => {
        const rampTime = parseInt(rampInput.value);
        if (isNaN(rampTime)) {
            alert('Please enter a valid ramp time value');
            return;
        }
        try {
            await sendPostRequest(`${API_BASE_URL}/TrajControl/Ramp/Start`, createEndpointPayload.START_RAMP(rampTime));
        } catch (error) {
            console.error('Failed to set ramp:', error);
        }
    });

    // Configuration application
    document.getElementById('apply-config').addEventListener('click', async () => {
        const operationModeDropdown = document.getElementById('operation-mode-select');
        const opModeText = operationModeDropdown.querySelector('.text').textContent;
        
        if (!opModeText || opModeText === 'Select Operation Mode') {
            alert('Please select an operation mode first');
            return;
        }

        const dataCycleNs = parseInt(document.getElementById('data-cycle-period').value);
        const rampUpRt = parseInt(document.getElementById('ramp-up-rate').value);
        const rampDwnRt = parseInt(document.getElementById('ramp-down-rate').value);
        const quickStopRt = parseInt(document.getElementById('quick-stop-rate').value);

        if ([dataCycleNs, rampUpRt, rampDwnRt, quickStopRt].some(isNaN)) {
            alert('Please fill in all configuration fields with valid numbers');
            return;
        }

        try {
            const response = await sendPostRequest(
                `${API_BASE_URL}/Configuration/Apply`,
                createEndpointPayload.APPLY_CONFIG(
                    opModeText,
                    dataCycleNs,
                    rampUpRt,
                    rampDwnRt,
                    quickStopRt
                )
            );
            alert('Configuration applied successfully');
        } catch (error) {
            alert(`Failed to apply configuration: ${error.message}`);
        }
    });

    // PID application
    document.getElementById('apply-pids').addEventListener('click', async () => {
        try {
            const speedPID = {
                Kp: parseFloat(document.querySelector('.speed-pid[data-pid="Kp"]').value),
                Ki: parseFloat(document.querySelector('.speed-pid[data-pid="Ki"]').value),
                Kd: parseFloat(document.querySelector('.speed-pid[data-pid="Kd"]').value)
            };

            const positionPID = {
                Kp: parseFloat(document.querySelector('.position-pid[data-pid="Kp"]').value),
                Ki: parseFloat(document.querySelector('.position-pid[data-pid="Ki"]').value),
                Kd: parseFloat(document.querySelector('.position-pid[data-pid="Kd"]').value)
            };

            const torquePID = {
                Kp: parseFloat(document.querySelector('.torque-pid[data-pid="Kp"]').value),
                Ki: parseFloat(document.querySelector('.torque-pid[data-pid="Ki"]').value),
                Kd: parseFloat(document.querySelector('.torque-pid[data-pid="Kd"]').value)
            };

            const allPIDValues = [...Object.values(speedPID), ...Object.values(positionPID), ...Object.values(torquePID)];
            if (allPIDValues.some(isNaN)) {
                alert('Please fill in all PID fields with valid numbers');
                return;
            }

            await sendPostRequest(`${API_BASE_URL}/Calibration/Apply`, 
                createEndpointPayload.CALIBRATION_APPLY(speedPID, positionPID, torquePID)
            );
        } catch (error) {
            console.error('Failed to apply PID values:', error);
        }
    });

    document.getElementById('restore-default').addEventListener('click', function() {
        const motorSelect = document.getElementById('motor-select');
        const selectedMotor = motorSelect.querySelector('input[type="hidden"]').value;
        if (selectedMotor !== 'custom') {
            const motorConfig = motorConfigManager.extractConfigData(selectedMotor);
            if (motorConfig) {
                populateFormFields(motorConfig);
            }
        }
    });
});

function handleMotorSelection(selectedMotor) {
    if (selectedMotor === 'custom') {
        clearFormFields();
        return;
    }
    
    const motorConfig = motorConfigManager.extractConfigData(selectedMotor);
    if (motorConfig) {
        populateFormFields(motorConfig);
    }
}

function handleOperationModeSelection(mode) {
    const states = operationModeStates[mode];
    if (!states) return;

    const trajectoryGroups = document.querySelectorAll('.trajectory-input-group');
    
    setTrajectoryGroupState(trajectoryGroups[0], states.trajectorySpeed);
    setTrajectoryGroupState(trajectoryGroups[1], states.trajectoryPosition);
    setTrajectoryGroupState(trajectoryGroups[2], states.trajectoryRamp);
}

function setTrajectoryGroupState(group, enabled) {
    if (!group) return;

    const inputs = group.querySelectorAll('input');
    const buttons = group.querySelectorAll('button');

    inputs.forEach(input => {
        input.disabled = !enabled;
        input.style.opacity = enabled ? '1' : '0.5';
        input.style.cursor = enabled ? 'auto' : 'not-allowed';
    });

    buttons.forEach(button => {
        button.disabled = !enabled;
        button.style.opacity = enabled ? '1' : '0.5';
        button.style.cursor = enabled ? 'pointer' : 'not-allowed';
    });

    group.style.opacity = enabled ? '1' : '0.5';
}

function setDropdownValue(dropdownId, value) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    const input = dropdown.querySelector('input[type="hidden"]');
    const text = dropdown.querySelector('.text');
    const item = dropdown.querySelector(`.item[data-value="${value}"]`);

    if (input) input.value = value;
    if (text && item) text.textContent = item.textContent;
}

function populateFormFields(config) {
    setDropdownValue('operation-mode-select', config.operationMode.toLowerCase());
    
    document.getElementById('data-cycle-period').value = config.dataCyclePeriod;
    document.getElementById('ramp-up-rate').value = config.rampUpRate;
    document.getElementById('ramp-down-rate').value = config.rampDownRate;
    document.getElementById('quick-stop-rate').value = config.quickStopRate;

    ['speed', 'position', 'torque'].forEach(type => {
        document.querySelectorAll(`.${type}-pid`).forEach(input => {
            const pidType = input.getAttribute('data-pid');
            input.value = config[`${type}PID`][pidType];
        });
    });
}

function clearFormFields() {
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.value = '';
    });
    
    const operationModeDropdown = document.getElementById('operation-mode-select');
    if (operationModeDropdown) {
        const text = operationModeDropdown.querySelector('.text');
        const input = operationModeDropdown.querySelector('input[type="hidden"]');
        if (text) text.textContent = 'Select Operation Mode';
        if (input) input.value = '';
    }
}