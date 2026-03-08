const { Cluster, ZCLDataTypes } = require("zigbee-clusters");
const { DataType } = require('@athombv/data-types');

// BITMAP8 type (ZCL type ID 0x18) that serializes/deserializes as a plain number.
// ZCLDataTypes.map8() returns a Bitmap object whose setBits() is not implemented,
// so it cannot be used for writeAttributes. This type uses raw uint8 read/write
// while advertising the BITMAP8 wire type that the Sonoff device requires.
const bitmap8 = new DataType(
    0x18,          // ZCL type ID for BITMAP8
    'bitmap8',
    1,             // 1 byte
    (buf, v, i) => buf.writeUInt8(typeof v === 'number' ? v & 0xFF : 0, i),
    (buf, i)    => buf.readUInt8(i)
);

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
            fault_code: {
                // Fault code (signed int32); reported by MINI-ZB2GS as e.g. 0x04020000
                id: 0x0010,
                type: ZCLDataTypes.int32
            },
            TurboMode: {
                // radioPower: ZBMINIR2, MINI-ZB2GS
                id: 0x0012,
                type: ZCLDataTypes.int16
                // 0x09 (9) = Off, 0x14 (20) = On
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
            deviceWorkMode: {
                // Device work mode (uint8); read during configure on MINI-ZB2GS, MINI-ZB2GS-L
                id: 0x0018,
                type: ZCLDataTypes.uint8
            },
            detach_relay_mode2: {
                //MINI-ZB2GS, multi-channel detach relay bitmap (BITMAP8)
                // bit0 = channel 1, bit1 = channel 2
                // Wire type 0x18 (BITMAP8); treated as plain number via custom bitmap8 type.
                id: 0x0019,
                type: bitmap8
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
            },
            protocolDataResponse: {
                // cmdId 0x0B: device acknowledgement to protocolData commands (e.g. inching)
                id: 0x0B,
                manufacturerId: 0x1286,
                args: {
                    status: ZCLDataTypes.uint8,
                    reserved: ZCLDataTypes.uint8,
                }
            }
        };
    }

    // Handler for protocolData device acknowledgement — no-op, prevents unknown_command_received errors
    protocolDataResponse(/* payload */) {}
}

module.exports = SonoffCluster;