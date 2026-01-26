const { Cluster, ZCLDataTypes } = require("zigbee-clusters");

class SonoffCluster extends Cluster {

    static get ID() {
        return 0xFC11;
    }
    
    static get NAME() {
        return 'SonoffCluster';
    }
    
    static get ZBMINIR2_ATTRIBUTES() {
        return [
            'TurboMode',
            'network_led',
            'power_on_delay_state',
            'power_on_delay_time',
            'switch_mode',
            'detach_mode'
        ];
    }
    
    static get ATTRIBUTES() {
        return {
            child_lock: {
                id: 0x0000,
                type: ZCLDataTypes.bool
            },
            TurboMode: {
                id: 0x0012,
                type: ZCLDataTypes.int16
            },        
            power_on_delay_state: {
                id: 0x0014,
                type: ZCLDataTypes.bool        
            },
            power_on_delay_time: {
                id: 0x0015,
                type: ZCLDataTypes.uint16
            },
            switch_mode: {
                id: 0x0016,
                type: ZCLDataTypes.uint8
            },
            detach_mode: {
                id: 0x0017,
                type: ZCLDataTypes.bool
            },
            network_led: {
                id: 0x0001,
                type: ZCLDataTypes.bool
            },
            backlight: {
                id: 0x0002,
                type: ZCLDataTypes.bool
            },
            tamper: {
                id: 0x2000,
                type: ZCLDataTypes.uint8
            },
            illuminance: {
                id: 0x2001,
                type: ZCLDataTypes.uint8
            },
            open_window: {
                id: 0x6000,
                type: ZCLDataTypes.bool
            },
            frost_protection_temperature: {
                id: 0x6002,
                type: ZCLDataTypes.int16
            },
            idle_steps: {
                id: 0x6003,
                type: ZCLDataTypes.uint16
            },
            closing_steps: {
                id: 0x6004,
                type: ZCLDataTypes.uint16
            },
            valve_opening_limit_voltage: {
                id: 0x6005,
                type: ZCLDataTypes.uint16
            },
            valve_closing_limit_voltage: {
                id: 0x6006,
                type: ZCLDataTypes.uint16
            },
            valve_motor_running_voltage: {
                id: 0x6007,
                type: ZCLDataTypes.uint16
            },
            valve_opening_degree: {
                id: 0x600b,
                type: ZCLDataTypes.uint8
            },
            valve_closing_degree: {
                id: 0x600c,
                type: ZCLDataTypes.uint8
            },
        };
    }

    static get COMMANDS() {
        return {
            protocolData: {
                id: 0x01,
                manufacturerSpecific: true,
                manufacturerId: 0x1286,
                args: {
                    data: ZCLDataTypes.buffer
                }
            },
            protocolDataResponse: {
                id: 0x0B,
                manufacturerSpecific: true,
                args: {
                    data: ZCLDataTypes.buffer
                }
            }
        };
    }

    protocolDataResponse(payload) {
        this.emit('protocolDataResponse', payload);
    }

    handleFrame(frame, meta) {
        if (frame.cmdId === 0x0B) {
            this.protocolDataResponse({ data: frame.data });
            return;
        }
        
        return super.handleFrame(frame, meta);
    }
}

module.exports = SonoffCluster;
