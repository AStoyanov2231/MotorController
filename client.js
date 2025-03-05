document.addEventListener("DOMContentLoaded", function () {
    const defaultJson = {
        "motor": "default",
        "configuration": {},
        "pids": {},
        "speed": 0,
        "position": 0
    };

    let currentJson = { ...defaultJson };
    
    const restoreDefaultsBtn = document.getElementById("restore-default");
    const applyConfigBtn = document.getElementById("apply-config");
    const applyPidsBtn = document.getElementById("apply-pids");
    const saveAllBtn = document.getElementById("save-all");
    const executeRampBtn = document.getElementById("execute-ramp");
    const speedInput = document.querySelector(".ui.action.input input[type='number']");
    const positionInput = document.querySelectorAll(".ui.action.input input[type='number']")[1];

    if (!restoreDefaultsBtn || !applyConfigBtn || !applyPidsBtn || !saveAllBtn || !executeRampBtn || !speedInput || !positionInput) {
        console.error("One or more elements were not found in the DOM!");
        return;
    }

    console.log("All elements found, script running...");

    // Restore Defaults
    restoreDefaultsBtn.addEventListener("click", function () {
        currentJson = { ...defaultJson };
        console.log("Defaults Restored:", currentJson);
    });

    // Apply Config
    applyConfigBtn.addEventListener("click", function () {
        sendCommand("applyCfg", { configuration: currentJson.configuration });
    });

    // Apply PIDs
    applyPidsBtn.addEventListener("click", function () {
        sendCommand("applyCfg", { pids: currentJson.pids });
    });

    // Save All
    saveAllBtn.addEventListener("click", function () {
        sendCommand("applyCfg", currentJson);
        downloadJson();
    });

    // Set Speed
    speedInput.addEventListener("change", function () {
        let speed = parseInt(speedInput.value, 10);
        if (!isNaN(speed)) {
            sendCommand("setSpd", { speed });
        }
    });

    // Set Position
    positionInput.addEventListener("change", function () {
        let position = parseInt(positionInput.value, 10);
        if (!isNaN(position)) {
            sendCommand("setPos", { position });
        }
    });

    // Start Ramp
    executeRampBtn.addEventListener("click", function () {
        sendCommand("Ramp", {});
    });

    async function sendCommand(command, payload) {
        try {
            let response = await fetch("http://127.0.0.1:3000/api/send-command", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ command, payload })
            });
    
            if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
    
            let result = await response.json();
            console.log(`Command: ${command}`, result);
        } catch (error) {
            console.error(`Failed to send ${command}`, error);
        }
    }

    // Download JSON
    function downloadJson() {
        const blob = new Blob([JSON.stringify(currentJson, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "config.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});
