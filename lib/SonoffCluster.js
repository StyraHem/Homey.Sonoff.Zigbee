const { Cluster, ZCLDataTypes } = require("zigbee-clusters");

class SonoffCluster extends Cluster {

    static get ID() {
        return 64529;
    }
    
    static get NAME() {
        return 'SonoffCluster';
    }
    
    static get ATTRIBUTES() {
        return {
            childLock: {
                id: 0x0000,
                type: ZCLDataTypes.bool
            },
            tamper: {
                id: 0x2000,
                type: ZCLDataTypes.uint8
            },
            illumination: {
                id: 0x2001,
                type: ZCLDataTypes.uint8
            },
            openWindow: {
                id: 0x6000,
                type: ZCLDataTypes.bool
            },
            frostProtectionTemperature: {
                id: 0x6002,
                type: ZCLDataTypes.int16
            },
            idleSteps: {
                id: 0x6003,
                type: ZCLDataTypes.uint16
            },
            closingSteps: {
                id: 0x6004,
                type: ZCLDataTypes.uint16
            },
            valveOpeningLimitVoltage: {
                id: 0x6005,
                type: ZCLDataTypes.uint16
            },
            valveClosingLimitVoltage: {
                id: 0x6006,
                type: ZCLDataTypes.uint16
            },
            valveMotorRunningVoltage: {
                id: 0x6007,
                type: ZCLDataTypes.uint16
            },
            valveOpeningDegree: {
                id: 0x600b,
                type: ZCLDataTypes.uint8
            },
            valveClosingDegree: {
                id: 0x600c,
                type: ZCLDataTypes.uint8
            },
        };
    }
}

module.exports = SonoffCluster;