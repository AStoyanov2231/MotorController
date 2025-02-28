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
                ki: $('.pid-group:eq(0) input:eq(0)').val(),
                kp: $('.pid-group:eq(0) input:eq(1)').val(),
                kd: $('.pid-group:eq(0) input:eq(2)').val(),
            },
            position: {
                ki: $('.pid-group:eq(1) input:eq(0)').val(),
                kp: $('.pid-group:eq(1) input:eq(1)').val(),
                kd: $('.pid-group:eq(1) input:eq(2)').val(),
            },
            torque: {
                ki: $('.pid-group:eq(2) input:eq(0)').val(),
                kp: $('.pid-group:eq(2) input:eq(1)').val(),
                kd: $('.pid-group:eq(2) input:eq(2)').val(),
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