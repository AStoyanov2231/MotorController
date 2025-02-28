$(document).ready(function() {
    // Initialize Semantic UI components
    $('.ui.dropdown').dropdown();

    // Handle Apply Config button
    $('#apply-config').click(function() {
        const motorType = $('#motor-select').val();
        const operationMode = $('#operation-mode').val();
        // Add your configuration logic here
        console.log('Applying configuration:', { motorType, operationMode });
    });

    // Handle Apply PIDs button
    $('#apply-pids').click(function() {
        // Collect PID values
        const pidValues = {
            speed: {
                ki: $('#speed-ki').val(),
                kp: $('#speed-kp').val(),
                kd: $('#speed-kd').val(),
            },
            position: {
                ki: $('#position-ki').val(),
                kp: $('#position-kp').val(),
                kd: $('#position-kd').val(),
            },
            torque: {
                ki: $('#torque-ki').val(),
                kp: $('#torque-kp').val(),
                kd: $('#torque-kd').val(),
            }
        };
        console.log('Applying PID values:', pidValues);
    });

    // Handle Execute Ramp button
    $('#execute-ramp').click(function() {
        const speed = $('.trajectory-control input:eq(0)').val();
        const position = $('.trajectory-control input:eq(1)').val();
        console.log('Executing ramp with:', { speed, position });
    });

    // Handle Restore Default button
    $('#restore-default').click(function() {
        // Add your restore default logic here
        console.log('Restoring default values');
    });

    // Handle Save All button
    $('#save-all').click(function() {
        // Add your save all logic here
        console.log('Saving all settings');
    });
}); 