// Motor configuration JSON strings
const ebmpapstConfig = `{
    "FileHeader": {
      "Name": "JSON",
      "Version": 0.9,
      "DataSize": 1234,
      "MD5": 123456789
    },
    "FileBody": {
      "SysCfg": {
         "Type": [ "uint32", "float", "float", "float", "float" ],
         "Payload": [
          {
            "ulDataCyclePeriodNs" : 1000000,
            "flStartVoltageRatio": 1.1,
            "tFldWk.Ki": 0,
            "tFldWk.Kp": 0.15,
            "tFldWk.Kd": 0
          }
         ]
      },
      "MotorCfg": {
        "Type": [ "uint8", "float", "uint16", "uint16", "bool" ],
        "Payload": [
          {
            "bMotorPolePairs": 3,
            "flMaxPhaseCurrAmp": 2.5,
            "usMinSpeedRpm": 0,
            "usMaxSpeedRpm": 5000,
            "fInvMotorDir": false
          }
        ]
      },
      "EncCfg": {
        "Type": [ "char*", "uint16", "uint32", "bool" ],
        "Payload": {
          "eEncLineDriver": "TTL",
          "usEncNumOfPulses": 256,
          "eEncFactor": 2,
          "fInvEncDir": true
        }
      },
      "HalCfg": {
        "Type": [ "float", "uint8", "uint8", "uint16", "uint16", "uint16", "float", "float", "float" ],
        "Payload": {
          "flRqstVdVector": 0.12,
          "bSamplingSpeedRPM": 12,
          "bMotorPolePairs": 3,
          "usMaxDeviationAngleDig": 4000,
          "usWaitTimeBetweenEachSample": 0,
          "usWaitTimeAfterAlignment": 500,
          "Hall.Ki": 0,
          "Hall.Kp": 0.15,
          "Hall.Kd": 0
        }
      },
      "AppCfg": {
        "Type": [ "char*", "uint32", "uint32", "uint32", "uint32" ],
        "Payload": {
          "OpMode": "Spd",
          "DataCyclePeriodNs" : 1000000,
          "RampUpRt": 10,
          "RampDwnRt": 10,
          "QuickStopRt": 1000
        }
      },
      "PidPrms": {
        "Type": [ "float", "float", "float" ],
        "Payload": [
          {
            "Ki": 1000.0,
            "Kp": 10000.0,
            "Kd": 250000.0
          },
          {
            "Ki": 0.04,
            "Kp": 0.002,
            "Kd": 0.0
          },
          {
            "Ki": 0.01,
            "Kp": 0.0001,
            "Kd": 0.0
          }
        ]
      }
    }
}`;

const maxonConfig = `{
    "FileHeader": {
      "Name": "JSON",
      "Version": 0.9,
      "DataSize": 1234,
      "MD5": 123456789
    },
    "FileBody": {
      "SysCfg": {
         "Type": [ "uint32", "float", "float", "float", "float" ],
         "Payload": [
          {
            "ulDataCyclePeriodNs" : 1000000,
            "flStartVoltageRatio": 1.1,
            "tFldWk.Ki": 0,
            "tFldWk.Kp": 0.15,
            "tFldWk.Kd": 0
          }
         ]
      },
      "MotorCfg": {
        "Type": [ "uint8", "float", "uint16", "uint16", "bool" ],
        "Payload": [
          {
            "bMotorPolePairs": 2,
            "flMaxPhaseCurrAmp": 2.48,
            "usMinSpeedRpm": 0,
            "usMaxSpeedRpm": 9960,
            "fInvMotorDir": false
          }
        ]
      },
      "EncCfg": {
        "Type": [ "char*", "uint16", "uint32", "bool" ],
        "Payload": {
          "eEncLineDriver": "RS422",
          "usEncNumOfPulses": 1024,
          "eEncFactor": 2,
          "fInvEncDir": false
        }
      },
      "HalCfg": {
        "Type": [ "float", "uint8", "uint8", "uint16", "uint16", "uint16", "float", "float", "float" ],
        "Payload": {
          "flRqstVdVector": 0.12,
          "bSamplingSpeedRPM": 12,
          "bMotorPolePairs": 3,
          "usMaxDeviationAngleDig": 4000,
          "usWaitTimeBetweenEachSample": 0,
          "usWaitTimeAfterAlignment": 500,
          "Hall.Ki": 0,
          "Hall.Kp": 0.15,
          "Hall.Kd": 0
        }
      },
      "AppCfg": {
        "Type": [ "char*", "uint32", "uint32", "uint32", "uint32" ],
        "Payload": {
          "OpMode": "Spd",
          "DataCyclePeriodNs" : 1000000,
          "RampUpRt": 10,
          "RampDwnRt": 10,
          "QuickStopRt": 1000
        }
      },
      "PidPrms": {
        "Type": [ "float", "float", "float" ],
        "Payload": [
          {
            "Ki": 1000.0,
            "Kp": 10000.0,
            "Kd": 250000.0
          },
          {
            "Ki": 0.04,
            "Kp": 0.002,
            "Kd": 0.0
          },
          {
            "Ki": 0.01,
            "Kp": 0.0001,
            "Kd": 0.0
          }
        ]
      }
    }
}`;

class MotorConfigManager {
    constructor() {
        console.log('Initializing MotorConfigManager');
        try {
            this.configs = {
                maxon: JSON.parse(maxonConfig),
                ebmpapst: JSON.parse(ebmpapstConfig)
            };
            console.log('Configs loaded successfully:', Object.keys(this.configs));
        } catch (error) {
            console.error('Error parsing motor configs:', error);
        }
    }

    getMotorConfig(motorType) {
        const config = this.configs[motorType.toLowerCase()];
        console.log(`Getting config for motor type: ${motorType}`, config ? 'Found' : 'Not found');
        return config;
    }

    extractConfigData(motorType) {
        console.log(`Extracting config data for motor type: ${motorType}`);
        const config = this.getMotorConfig(motorType);
        if (!config) {
            console.log('No config found for motor type:', motorType);
            return null;
        }

        const extractedData = {
            // System Configuration
            dataCyclePeriod: config.FileBody.SysCfg.Payload[0].ulDataCyclePeriodNs,
            
            // Motor Configuration
            motorPolePairs: config.FileBody.MotorCfg.Payload[0].bMotorPolePairs,
            maxSpeed: config.FileBody.MotorCfg.Payload[0].usMaxSpeedRpm,
            minSpeed: config.FileBody.MotorCfg.Payload[0].usMinSpeedRpm,
            
            // Application Configuration
            operationMode: config.FileBody.AppCfg.Payload.OpMode,
            rampUpRate: config.FileBody.AppCfg.Payload.RampUpRt,
            rampDownRate: config.FileBody.AppCfg.Payload.RampDwnRt,
            quickStopRate: config.FileBody.AppCfg.Payload.QuickStopRt,
            
            // PID Parameters
            speedPID: config.FileBody.PidPrms.Payload[0],
            positionPID: config.FileBody.PidPrms.Payload[1],
            torquePID: config.FileBody.PidPrms.Payload[2]
        };

        console.log('Extracted config data:', extractedData);
        return extractedData;
    }
}

// Create a global instance of the manager
window.motorConfigManager = new MotorConfigManager(); 