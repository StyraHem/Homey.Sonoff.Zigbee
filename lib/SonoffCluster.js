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
    (buf, i) => buf.readUInt8(i)
);

// BITMAP32 type (ZCL type ID 0x1B) that serializes/deserializes as a plain number.
const bitmap32 = new DataType(
    0x1b,          // ZCL type ID for BITMAP32
    'bitmap32',
    4,             // 4 bytes
    (buf, v, i) => buf.writeUInt32LE(typeof v === 'number' ? v : 0, i),
    (buf, i) => buf.readUInt32LE(i)
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
            child_lock: { id: 0x0000, type: ZCLDataTypes.bool },
            fault_code: { id: 0x0010, type: ZCLDataTypes.int32 },
            TurboMode: { id: 0x0012, type: ZCLDataTypes.int16 },
            power_on_delay_state: { id: 0x0014, type: ZCLDataTypes.bool },
            power_on_delay_time: { id: 0x0015, type: ZCLDataTypes.uint16 },
            switch_mode: { id: 0x0016, type: ZCLDataTypes.uint8 },
            detach_mode: { id: 0x0017, type: ZCLDataTypes.bool },
            deviceWorkMode: { id: 0x0018, type: ZCLDataTypes.uint8 },
            detach_relay_mode2: { id: 0x0019, type: bitmap8 },
            inching_control_bits: { id: 0x001c, type: bitmap32 },
            network_led: { id: 0x0001, type: ZCLDataTypes.bool },
            backlight: { id: 0x0002, type: ZCLDataTypes.bool },
            tamper: { id: 0x2000, type: ZCLDataTypes.uint8 },
            illuminance: { id: 0x2001, type: ZCLDataTypes.uint8 },
            open_window: { id: 0x6000, type: ZCLDataTypes.bool },
            frost_protection_temperature: { id: 0x6002, type: ZCLDataTypes.int16 },
            idle_steps: { id: 0x6003, type: ZCLDataTypes.uint16 },
            closing_steps: { id: 0x6004, type: ZCLDataTypes.uint16 },
            valve_opening_limit_voltage: { id: 0x6005, type: ZCLDataTypes.uint16 },
            valve_closing_limit_voltage: { id: 0x6006, type: ZCLDataTypes.uint16 },
            valve_motor_running_voltage: { id: 0x6007, type: ZCLDataTypes.uint16 },
            valve_opening_degree: { id: 0x600b, type: ZCLDataTypes.uint8 },
            valve_closing_degree: { id: 0x600c, type: ZCLDataTypes.uint8 },
            calibration_status: { id: 0x001e, type: ZCLDataTypes.uint8 },
            transition_time: { id: 0x001f, type: ZCLDataTypes.uint32 },
            calibration_progress: { id: 0x0020, type: ZCLDataTypes.uint8 },
            min_brightness_threshold: { id: 0x4001, type: ZCLDataTypes.uint8 },
            max_brightness_threshold: { id: 0x4002, type: ZCLDataTypes.uint8 },
            dimming_light_rate: { id: 0x4003, type: ZCLDataTypes.uint8 },
            level_for_calibration: { id: 0x4006, type: ZCLDataTypes.uint8 },
            protocolDataReport: { id: 0x0022, type: ZCLDataTypes.buffer }
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

    static get COMMANDS_RESPONSE() {
        return {
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

    // Handlers for device responses — no-op, prevents unknown_command_received errors
    protocolDataResponse(/* payload */) { }

    // Catch the duplicate global defaultResponse (0x0B) sent by some Sonoff firmwares
    // that incorrectly attach the manufacturerSpecific flag without the clusterSpecific bit.
    // This prevents the library from throwing "unknown_command_received" after the transaction is already completed.
    onDefaultResponse() { }
}

module.exports = SonoffCluster;