export const API_BASE_URL = 'http://127.0.0.1:3000';

// Operation mode text mapping
const OPERATION_MODE_MAP = {
    'Speed': 'Spd',
    'Position': 'Pos',
    'Manual Speed': 'Manual-Spd',
    'Manual Position': 'Manual-Pos'
};

export const createEndpointPayload = {
    START_SPEED: (value = 1000) => ({
        StartSpd: {
            Type: ["uint32"],
            Payload: {
                Val: value
            }
        }
    }),
    
    START_POSITION: (value = 1000) => ({
        StartPos: {
            Type: ["uint32"],
            Payload: {
                Val: value
            }
        }
    }),
    
    START_RAMP: (time = 1000) => ({
        StartRamp: {
            Type: ["uint32"],
            Payload: {
                Time: time
            }
        }
    }),
    
    APPLY_CONFIG: (
        displayOpMode = "Speed",
        dataCycleNs = 1000000,
        rampUpRt = 1000,
        rampDwnRt = 1000,
        quickStopRt = 100
    ) => ({
        AppCfg: {
            Type: ["char*", "uint32", "uint32", "uint32", "uint32"],
            Payload: {
                OpMode: OPERATION_MODE_MAP[displayOpMode] || displayOpMode,
                DataCycleNs: dataCycleNs,
                RampUpRt: rampUpRt,
                RampDwnRt: rampDwnRt,
                QuickStopRt: quickStopRt
            }
        }
    }),
    
    CALIBRATION_APPLY: (
        speedPID = {Ki: 100, Kp: 100, Kd: 100},
        positionPID = {Ki: 100, Kp: 100, Kd: 100},
        torquePID = {Ki: 100, Kp: 100, Kd: 100}) => ({
            PidPrms: {
            Type: ["float", "float", "float"],
            Payload: [
                speedPID,
                positionPID,
                torquePID
            ]
        }
    })
};

// For backward compatibility
export const API_ENDPOINTS = {
    START_SPEED: createEndpointPayload.START_SPEED(),
    START_POSITION: createEndpointPayload.START_POSITION(),
    START_RAMP: createEndpointPayload.START_RAMP(),
    APPLY_CONFIG: createEndpointPayload.APPLY_CONFIG(),
    CALIBRATION_APPLY: createEndpointPayload.CALIBRATION_APPLY()
};