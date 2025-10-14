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
            child_lock: {
                id: 0x0000,
                type: ZCLDataTypes.bool
            },
            TurboMode: {
                //ZBMINIR2
                id: 0x0012,
                type: ZCLDataTypes.int16
                //9 Off, 20 On
            },        
            power_on_delay_state: {
                //ZBMINIR2
                id: 0x0014,
                type: ZCLDataTypes.bool        
            },
            power_on_delay_time: {
                //ZBMINIR2
                id: 0x0015,
                type: ZCLDataTypes.uint16
            },
            switch_mode: {
                //ZBMINIR2
                id: 0x0016,
                type: ZCLDataTypes.uint8
                // type: ZCLDataTypes.enum8({
                //   edge: 0x00,
                //   pulse: 0x01,
                //   follow_on: 0x02,
                //   follow_off: 0x82,
                // })
            },
            detach_mode: {
                //ZBMINIR2
                id: 0x0017,
                type: ZCLDataTypes.bool
            },
            network_led: {
                //ZBMINIR2, switches, plugs
                id: 0x0001,
                type: ZCLDataTypes.bool
            },
            backlight: {
                //switches
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
                manufacturerId: 0x1286, // Sonoff/eWeLink manufacturer code
                args: {
                    data: ZCLDataTypes.buffer
                }
            }
        };
    }
}

module.exports = SonoffCluster;