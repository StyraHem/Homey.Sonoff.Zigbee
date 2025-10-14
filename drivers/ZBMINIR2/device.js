'use strict';

const { ZigBeeDevice } = require("homey-zigbeedriver");

const SonoffOnOffCluster = require("../../lib/SonoffOnOffCluster");
const { Cluster, CLUSTER, BoundCluster } = require('zigbee-clusters');
Cluster.addCluster(SonoffOnOffCluster);

const SonoffCluster = require("../../lib/SonoffCluster");
Cluster.addCluster(SonoffCluster);

const SonoffBase = require('../sonoffbase');

class MyOnOffBoundCluster extends BoundCluster {
    constructor(node) {
        super();
        this.node = node;
        this._click = node.homey.flow.getDeviceTriggerCard("ZBMINIR2:click");
    }
    toggle() {
        this._click.trigger(this.node, {}, {}).catch(this.node.error);
    }
}

const SonoffClusterAttributes = [
    'TurboMode',
    'network_led',
	'power_on_delay_state',
	'power_on_delay_time',
    'switch_mode',
    'detach_mode'
];

class SonoffZBMINIR2 extends SonoffBase {

 /**
   * onInit is called when the device is initialized.
   */
    async onNodeInit({ zclNode }) {
        
        super.onNodeInit({zclNode});

        if (this.hasCapability('onoff')) {
            this.registerCapability('onoff', CLUSTER.ON_OFF);
        }

        this.configureAttributeReporting([			
			{
				endpointId: 1,
				cluster: CLUSTER.ON_OFF,
				attributeName: 'onOff',
                minInterval: 0,
                maxInterval: 3600                
			}
		]).catch(this.error);

        this.zclNode.endpoints[1].bind(CLUSTER.ON_OFF.NAME, new MyOnOffBoundCluster(this));
        
        this.checkAttributes();
        
        // Apply inching settings on initialization
        const settings = this.getSettings();
        if (settings.inching_enabled !== undefined) {
            try {
                await this.setInching(
                    settings.inching_enabled,
                    settings.inching_time || 1000,
                    settings.inching_mode || 'on'
                );
                this.log('Initial inching settings applied');
            } catch (error) {
                this.error('Failed to apply initial inching settings:', error);
            }
        }
    }

    /**
     * onSettings is called when the user updates the device's settings.
     * @param {object} event the onSettings event data
     * @param {object} event.oldSettings The old settings object
     * @param {object} event.newSettings The new settings object
     * @param {string[]} event.changedKeys An array of keys changed since the previous version
     * @returns {Promise<string|void>} return a custom message that will be displayed
     */
    async onSettings({ oldSettings, newSettings, changedKeys }) {
        if (changedKeys.includes("power_on_behavior")) {
            try {
                await this.zclNode.endpoints[1].clusters.onOff.writeAttributes({ powerOnBehavior: newSettings.power_on_behavior });
            } catch (error) {
                this.log("Error updating the power on behavior");
            }
        }

        this.writeAttributes(SonoffCluster, newSettings, changedKeys).catch(this.error);

        // Handle inching settings changes
        const inchingKeys = ['inching_enabled', 'inching_mode', 'inching_time'];
        const inchingChanged = changedKeys.some(key => inchingKeys.includes(key));
        
        if (inchingChanged) {
            try {
                await this.setInching(
                    newSettings.inching_enabled,
                    newSettings.inching_time,
                    newSettings.inching_mode
                );
                this.log('Inching settings updated:', {
                    enabled: newSettings.inching_enabled,
                    mode: newSettings.inching_mode,
                    time: newSettings.inching_time
                });
            } catch (error) {
                this.error('Error updating inching settings:', error);
                throw new Error('Failed to update inching settings');
            }
        }
  }

    /**
     * Set inching (auto-off/on) configuration
     * @param {boolean} enabled - Enable or disable inching
     * @param {number} time - Time in seconds (0.1-3600)
     * @param {string} mode - 'on' (turn ON then OFF) or 'off' (turn OFF then ON)
     */
    async setInching(enabled = false, time = 1, mode = 'on') {
        try {
        // Convert time from seconds to milliseconds, then to 0.5 second units (as per Zigbee2MQTT)
        const msTime = Math.round(time * 1000);
        const rawTimeUnits = Math.round(msTime / 500);
        const tmpTime = Math.min(Math.max(rawTimeUnits, 1), 0xffff);
        
        // Build payload according to Zigbee2MQTT format (sonoff.ts lines 231-271)
        const payloadValue = [];
        payloadValue[0] = 0x01;  // Cmd
        payloadValue[1] = 0x17;  // SubCmd - INCHING SUBCOMMAND
        payloadValue[2] = 0x07;  // Length (7 bytes of data follow)
        payloadValue[3] = 0x80;  // SeqNum
        
        // Byte 4: Mode (bit flags)
        payloadValue[4] = 0x00;
        if (enabled) {
            payloadValue[4] |= 0x80;  // Bit 7: Enable inching
        }
        if (mode === 'on') {
            payloadValue[4] |= 0x01;  // Bit 0: Inching mode (1=ON then OFF, 0=OFF then ON)
        }
        
        payloadValue[5] = 0x00;  // Channel (0 = channel 1)
        
        // Byte 6-7: Timeout (little-endian, in 0.5s units)
        payloadValue[6] = tmpTime & 0xff;         // Low byte
        payloadValue[7] = (tmpTime >> 8) & 0xff;  // High byte
        
        payloadValue[8] = 0x00;  // Reserve
        payloadValue[9] = 0x00;  // Reserve
        
        // Byte 10: CheckCode (XOR checksum of first length+3 bytes)
        payloadValue[10] = 0x00;
        for (let i = 0; i < payloadValue[2] + 3; i++) {
            payloadValue[10] ^= payloadValue[i];
        }
        
        this.log('Sending inching command:', {
            enabled,
            mode,
            time_ms: time,
            time_half_seconds: tmpTime,
            payload_array: payloadValue,
            payload_hex: Buffer.from(payloadValue).toString('hex'),
            payload_breakdown: {
                cmd: '0x' + payloadValue[0].toString(16).padStart(2, '0'),
                subcmd: '0x' + payloadValue[1].toString(16).padStart(2, '0'),
                length: payloadValue[2],
                seqnum: '0x' + payloadValue[3].toString(16).padStart(2, '0'),
                mode_byte: '0x' + payloadValue[4].toString(16).padStart(2, '0'),
                channel: payloadValue[5],
                time_low: '0x' + payloadValue[6].toString(16).padStart(2, '0'),
                time_high: '0x' + payloadValue[7].toString(16).padStart(2, '0'),
                checksum: '0x' + payloadValue[10].toString(16).padStart(2, '0')
            }
        });
        
        // Get the cluster instance
        const cluster = this.zclNode.endpoints[1].clusters['SonoffCluster'];
        
        // Call the protocolData command exactly as Zigbee2MQTT does
        // Pass the complete payload array (including Cmd byte) in the data field
        const payloadBuffer = Buffer.from(payloadValue);

        await cluster.protocolData(
            { data: payloadBuffer },
            { disableDefaultResponse: true, waitForResponse: false }
        );
        
        this.log('Inching command sent successfully')
        
    } catch (error) {
        this.error('Failed to set inching:', error);
        throw error;
    }
  }

  async checkAttributes() {
    
    this.readAttribute(CLUSTER.ON_OFF, ['powerOnBehavior'], (data) => {
        this.setSettings({ power_on_behavior: data.powerOnBehavior }).catch(this.error); //, switch_type: switchType });
    });
    
    this.readAttribute(SonoffCluster, SonoffClusterAttributes, (data) => {
        this.setSettings(data).catch(this.error);
    });
    
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
    async onDeleted() {
        this.log("smartswitch removed");
    }

}

module.exports = SonoffZBMINIR2;
