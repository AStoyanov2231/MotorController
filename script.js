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

// Operation mode mapping for field states
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

// Initialize UI components
document.addEventListener('DOMContentLoaded', function() {
    console.log('Document ready, initializing...');
    
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

                // Handle motor selection if this is the motor dropdown
                if (dropdown.id === 'motor-select') {
                    handleMotorSelection(value);
                }
                // Handle operation mode selection
                else if (dropdown.id === 'operation-mode-select') {
                    handleOperationModeSelection(value);
                }
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
                menu.classList.remove('visible');
            }
        });
    });

    // Initial state - disable all trajectory fields
    handleOperationModeSelection('speed');

    // Get speed control elements
    const speedInput = document.querySelector('.trajectory-input-group:nth-child(1) input');
    const speedSetButton = document.querySelector('.trajectory-input-group:nth-child(1) .primary.button');
    const speedStopButton = document.querySelector('.trajectory-input-group:nth-child(1) .button:not(.primary)');

    // Get position control elements
    const positionInput = document.querySelector('.trajectory-input-group:nth-child(2) input');
    const positionSetButton = document.querySelector('.trajectory-input-group:nth-child(2) .primary.button');
    const positionStopButton = document.querySelector('.trajectory-input-group:nth-child(2) .button:not(.primary)');

    // Speed control event listeners
    speedSetButton.addEventListener('click', async () => {
        try {
            const speed = parseInt(speedInput.value);
            if (isNaN(speed)) {
                alert('Please enter a valid speed value');
                return;
            }
            await sendPostRequest(`${API_BASE_URL}/TrajControl/Speed/Start`, createEndpointPayload.START_SPEED(speed));
        } catch (error) {
            console.error('Failed to set motor speed:', error);
        }
    });

    speedStopButton.addEventListener('click', async () => {
        try {
            await sendPostRequest(`${API_BASE_URL}/TrajControl/Speed/Stop`, {});
            console.log('Motor speed stopped');
        } catch (error) {
            console.error('Failed to stop motor:', error);
        }
    });

    // Position control event listeners
    positionSetButton.addEventListener('click', async () => {
        try {
            const position = parseInt(positionInput.value);
            if (isNaN(position)) {
                alert('Please enter a valid position value');
                return;
            }
            await sendPostRequest(`${API_BASE_URL}/TrajControl/Position/Start`, createEndpointPayload.START_POSITION(position));
        } catch (error) {
            console.error('Failed to set motor position:', error);
        }
    });

    positionStopButton.addEventListener('click', async () => {
        try {
            await sendPostRequest(`${API_BASE_URL}/TrajControl/Position/Stop`, {});
            console.log('Motor position control stopped');
        } catch (error) {
            console.error('Failed to stop position control:', error);
        }
    });

    ///////////////////////////////////////////
    ///////////////////////////////////////////
    ///////////////////////////////////////////
    ///////////////////////////////////////////
    ///////////////////////////////////////////
    ///////////////////////////////////////////
    ///////////////////////////////////////////

    // Ramp control event listeners
    const rampInput = document.querySelector('.trajectory-input-group:nth-child(3) input');
    const rampSetButton = document.querySelector('.trajectory-input-group:nth-child(3) .primary.button');

    rampSetButton.addEventListener('click', async () => {
        try {
            const rampTime = parseInt(rampInput.value);
            if (isNaN(rampTime)) {
                alert('Please enter a valid ramp time value');
                return;
            }
            await sendPostRequest(`${API_BASE_URL}/TrajControl/Ramp/Start`, createEndpointPayload.START_RAMP(rampTime));
            console.log(`Ramp set to ${rampTime}`);
        } catch (error) {
            console.error('Failed to set ramp:', error);
        }
    });

    // Configuration application event listener
    document.getElementById('apply-config').addEventListener('click', async () => {
        try {
            // Get operation mode from dropdown first
            const operationModeDropdown = document.getElementById('operation-mode-select');
            const opModeText = operationModeDropdown.querySelector('.text').textContent;
            
            // Check if a valid operation mode is selected
            if (!opModeText || opModeText === 'Select Operation Mode') {
                alert('Please select an operation mode first');
                return;
            }

            // Get all configuration values
            const dataCycleNs = parseInt(document.getElementById('data-cycle-period').value);
            const rampUpRt = parseInt(document.getElementById('ramp-up-rate').value);
            const rampDwnRt = parseInt(document.getElementById('ramp-down-rate').value);
            const quickStopRt = parseInt(document.getElementById('quick-stop-rate').value);

            // Validate configuration values
            if ([dataCycleNs, rampUpRt, rampDwnRt, quickStopRt].some(isNaN)) {
                alert('Please fill in all configuration fields with valid numbers');
                return;
            }

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
            console.log('Configuration response:', response);
            alert('Configuration applied successfully');
        } catch (error) {
            console.error('Failed to apply configuration:', error);
            alert(`Failed to apply configuration: ${error.message}`);
        }
    });

    // PID application event listener
    document.getElementById('apply-pids').addEventListener('click', async () => {
        try {
            // Get Speed PID values
            const speedPID = {
                Kp: parseFloat(document.querySelector('.speed-pid[data-pid="Kp"]').value),
                Ki: parseFloat(document.querySelector('.speed-pid[data-pid="Ki"]').value),
                Kd: parseFloat(document.querySelector('.speed-pid[data-pid="Kd"]').value)
            };

            // Get Position PID values
            const positionPID = {
                Kp: parseFloat(document.querySelector('.position-pid[data-pid="Kp"]').value),
                Ki: parseFloat(document.querySelector('.position-pid[data-pid="Ki"]').value),
                Kd: parseFloat(document.querySelector('.position-pid[data-pid="Kd"]').value)
            };

            // Get Torque PID values
            const torquePID = {
                Kp: parseFloat(document.querySelector('.torque-pid[data-pid="Kp"]').value),
                Ki: parseFloat(document.querySelector('.torque-pid[data-pid="Ki"]').value),
                Kd: parseFloat(document.querySelector('.torque-pid[data-pid="Kd"]').value)
            };

            // Validate PID values
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

    ///////////////////////////////////////////
    ///////////////////////////////////////////
    ///////////////////////////////////////////
    ///////////////////////////////////////////
    ///////////////////////////////////////////
    ///////////////////////////////////////////
    ///////////////////////////////////////////
    ///////////////////////////////////////////

    function handleMotorSelection(selectedMotor) {
        console.log('Handling motor selection:', selectedMotor);
        
        if (selectedMotor === 'custom') {
            clearFormFields();
            return;
        }
        
        const motorConfig = motorConfigManager.extractConfigData(selectedMotor);
        console.log('Motor config:', motorConfig);
        
        if (motorConfig) {
            populateFormFields(motorConfig);
        }
    }

    function handleOperationModeSelection(mode) {
        console.log('Operation mode selected:', mode);
        const states = operationModeStates[mode];
        if (!states) return;

        // Get all trajectory input groups
        const trajectoryGroups = document.querySelectorAll('.trajectory-input-group');
        
        // Handle Speed trajectory
        const speedGroup = trajectoryGroups[0];
        setTrajectoryGroupState(speedGroup, states.trajectorySpeed);

        // Handle Position trajectory
        const positionGroup = trajectoryGroups[1];
        setTrajectoryGroupState(positionGroup, states.trajectoryPosition);

        // Handle Ramp trajectory
        const rampGroup = trajectoryGroups[2];
        setTrajectoryGroupState(rampGroup, states.trajectoryRamp);
    }

    function setTrajectoryGroupState(group, enabled) {
        if (!group) return;

        // Get all inputs and buttons in the group
        const inputs = group.querySelectorAll('input');
        const buttons = group.querySelectorAll('button');

        // Set the disabled state and visual appearance
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

        // Add visual feedback for disabled state
        group.style.opacity = enabled ? '1' : '0.5';
    }

    // Add event listeners for other buttons
    document.getElementById('restore-default').addEventListener('click', function() {
        console.log('Restoring defaults...');
        const motorSelect = document.getElementById('motor-select');
        const selectedMotor = motorSelect.querySelector('input[type="hidden"]').value;
        if (selectedMotor !== 'custom') {
            const motorConfig = motorConfigManager.extractConfigData(selectedMotor);
            if (motorConfig) {
                populateFormFields(motorConfig);
            }
        }
    });

    document.getElementById('save-all').addEventListener('click', function() {
        console.log('Saving all configurations...');
    });
});

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
    console.log('Populating form fields with config:', config);
    
    // Populate operation mode
    setDropdownValue('operation-mode-select', config.operationMode.toLowerCase());
    
    // Populate basic configuration fields
    document.getElementById('data-cycle-period').value = config.dataCyclePeriod;
    document.getElementById('ramp-up-rate').value = config.rampUpRate;
    document.getElementById('ramp-down-rate').value = config.rampDownRate;
    document.getElementById('quick-stop-rate').value = config.quickStopRate;

    // Populate Speed PID fields
    document.querySelectorAll('.speed-pid').forEach(input => {
        const pidType = input.getAttribute('data-pid');
        input.value = config.speedPID[pidType];
    });

    // Populate Position PID fields
    document.querySelectorAll('.position-pid').forEach(input => {
        const pidType = input.getAttribute('data-pid');
        input.value = config.positionPID[pidType];
    });

    // Populate Torque PID fields
    document.querySelectorAll('.torque-pid').forEach(input => {
        const pidType = input.getAttribute('data-pid');
        input.value = config.torquePID[pidType];
    });
}

function clearFormFields() {
    console.log('Clearing all form fields');
    // Clear all input fields
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.value = '';
    });
    
    // Reset dropdowns to default
    const operationModeDropdown = document.getElementById('operation-mode-select');
    if (operationModeDropdown) {
        const text = operationModeDropdown.querySelector('.text');
        const input = operationModeDropdown.querySelector('input[type="hidden"]');
        if (text) text.textContent = 'Select Operation Mode';
        if (input) input.value = '';
    }
}