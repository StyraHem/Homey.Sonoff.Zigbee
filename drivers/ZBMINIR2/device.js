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
        this.node.log('Detach Mode: Physical switch toggled, triggering Flow Card');
        this._click.trigger(this.node, {}, {})
            .catch(err => this.node.error('Failed to trigger click flow:', err));
    }
}

const TURBO_MODE_VALUES = {
    OFF: 9,
    ON: 20
};

const INCHING_PROTOCOL = {
    CMD: 0x01,
    SUBCMD_INCHING: 0x17,
    PAYLOAD_LENGTH: 0x07,
    SEQ_NUM: 0x80,
    FLAG_ENABLE: 0x80,
    FLAG_MODE_ON: 0x01
};

class SonoffZBMINIR2 extends SonoffBase {

    _verifyTimeout = null;

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
                minInterval: 1,
                maxInterval: 3600,
                minChange: 1
            }
        ]).catch(err => this.error(`Failed to configure attribute reporting:`, err));

        this.zclNode.endpoints[1].bind(CLUSTER.ON_OFF.NAME, new MyOnOffBoundCluster(this));
        
        const sonoffCluster = this.zclNode.endpoints[1].clusters.SonoffCluster;
        
        if (!sonoffCluster) {
            this.error(`SonoffCluster not available on this device`);
            return;
        }
        
        sonoffCluster.manufacturerId = 0x1286;
        
        sonoffCluster.on('protocolDataResponse', (payload) => {
            this.log(`ZBMINIR2: Received protocolDataResponse (cmdId 11)`);
            
            if (payload && payload.data && Buffer.isBuffer(payload.data)) {
                const buffer = payload.data;
                const cmdType = buffer[0];
                const status = buffer.length > 1 ? buffer[1] : null;
                
                this.log(`  Command type: 0x${cmdType.toString(16)}`);
                this.log(`  Status: 0x${status !== null ? status.toString(16) : 'N/A'} (${status === 0x00 ? 'SUCCESS' : 'FAILURE'})`);
                this.log(`  Raw data: ${buffer.toString('hex')}`);
                
                switch (cmdType) {
                    case 0x01:
                        if (status === 0x00) {
                            this.log(`  Inching command executed successfully`);
                        } else if (status === 0x81) {
                            this.log(`  Inching rejected by firmware (check: detach_mode=false, compatible switch_mode, relay state)`);
                        } else {
                            this.error(`  Inching failed with status=0x${status !== null ? status.toString(16) : 'unknown'}`);
                        }
                        break;
                    default:
                        this.log(`  Unknown command type: 0x${cmdType.toString(16)}`);
                }
            } else {
                this.log(`  Received protocolDataResponse but no data`);
            }
        });
        
        this.log(`ZBMINIR2: protocolDataResponse event listener registered`);
        
        this.checkAttributes();
        
        const settings = this.getSettings();
        if (settings && settings.inching_enabled !== undefined) {
            try {
                const inchingTime = settings.inching_time || 1;
                const inchingMode = settings.inching_mode || 'on';
                
                await this.setInching(
                    settings.inching_enabled,
                    inchingTime,
                    inchingMode
                );
                this.log(`Initial inching settings applied`);
            } catch (error) {
                this.error(`Failed to apply initial inching settings:`, error);
            }
        }
    }

    /**
     * Convert TurboMode raw value (radioPower) to boolean
     */
    _parseTurboMode(rawValue) {
        if (rawValue === TURBO_MODE_VALUES.ON || rawValue === true || rawValue === 1) {
            return true;
        }
        return false;
    }

    /**
     * Convert boolean to TurboMode raw value (radioPower)
     */
    _formatTurboMode(enabled) {
        return enabled ? TURBO_MODE_VALUES.ON : TURBO_MODE_VALUES.OFF;
    }

    _formatSwitchMode(mode) {
        return parseInt(mode, 10);
    }

    _parseSwitchMode(mode) {
        return String(mode);
    }

    async onSettings({ oldSettings, newSettings, changedKeys }) {
        this.log(`Settings changed:`, changedKeys);

        const onOffCluster = this.zclNode.endpoints[1].clusters.onOff;

        if (changedKeys.includes("power_on_behavior")) {
            try {
                await onOffCluster.writeAttributes({
                    powerOnBehavior: newSettings.power_on_behavior
                });
                this.log(`Power-on behavior updated successfully`);
                
                this._verifyTimeout = setTimeout(async () => {
                    this._verifyTimeout = null;
                    try {
                        const result = await onOffCluster.readAttributes('powerOnBehavior');
                        this.log(`Power-on behavior verified:`, result.powerOnBehavior);
                    } catch (err) {
                        this.error(`Failed to verify power-on behavior:`, err);
                    }
                }, 1000);
            } catch (error) {
                this.error(`Error updating power_on_behavior:`, error);
                throw new Error(`Failed to update power-on behavior: ${error.message}`);
            }
        }

        if (changedKeys.includes('TurboMode')) {
            try {
                const rawValue = this._formatTurboMode(newSettings.TurboMode);
                this.log(`Writing TurboMode: ${newSettings.TurboMode} → raw value: 0x${rawValue.toString(16)} (${rawValue})`);
                
                await this.writeAttribute(SonoffCluster, 'TurboMode', rawValue);
                
                this.log(`TurboMode updated successfully to ${newSettings.TurboMode}`);
            } catch (error) {
                this.error(`Error updating TurboMode:`, error);
                throw new Error(`Failed to update Turbo Mode: ${error.message}`);
            }
        }

        if (changedKeys.includes('switch_mode')) {
            try {
                const rawValue = this._formatSwitchMode(newSettings.switch_mode);
                this.log(`Writing switch_mode: "${newSettings.switch_mode}" → raw value: ${rawValue}`);
                
                await this.writeAttribute(SonoffCluster, 'switch_mode', rawValue);
                
                this.log(`switch_mode updated successfully to ${newSettings.switch_mode}`);
            } catch (error) {
                this.error(`Error updating switch_mode:`, error);
                throw new Error(`Failed to update switch mode: ${error.message}`);
            }
        }

        const otherSonoffKeys = changedKeys.filter(key =>
            SonoffCluster.ZBMINIR2_ATTRIBUTES.includes(key) &&
            key !== 'TurboMode' &&
            key !== 'switch_mode'
        );
        
        if (otherSonoffKeys.length > 0) {
            try {
                this.log(`Updating other SonoffCluster attributes:`, otherSonoffKeys);
                await this.writeAttributes(SonoffCluster, newSettings, otherSonoffKeys);
                this.log(`SonoffCluster attributes updated successfully`);
            } catch (error) {
                this.error(`Error updating SonoffCluster attributes:`, error);
                throw new Error(`Failed to update device settings: ${error.message}`);
            }
        }

        const inchingKeys = ['inching_enabled', 'inching_mode', 'inching_time'];
        const inchingChanged = changedKeys.some(key => inchingKeys.includes(key));
        
        if (inchingChanged) {
            try {
                await this.setInching(
                    newSettings.inching_enabled,
                    newSettings.inching_time,
                    newSettings.inching_mode
                );
                this.log(`Inching settings updated successfully`);
            } catch (error) {
                this.error(`Error updating inching settings:`, error);
                throw new Error(`Failed to update inching settings: ${error.message}`);
            }
        }
    }

    async setInching(enabled = false, time = 1, mode = 'on') {
        if (typeof enabled !== 'boolean') {
            throw new TypeError(`enabled must be boolean, got ${typeof enabled}`);
        }
        if (typeof time !== 'number' || time < 0 || time > 32767.5) {
            throw new RangeError(`time must be between 0 and 32767.5 seconds, got ${time}`);
        }
        if (!['on', 'off'].includes(mode)) {
            throw new TypeError(`mode must be "on" or "off", got "${mode}"`);
        }
        
        try {
            const msTime = Math.round(time * 1000);
            const rawTimeUnits = Math.round(msTime / 500);
            const tmpTime = Math.min(Math.max(rawTimeUnits, 1), 0xffff);
            
            const payloadValue = [];
            payloadValue[0] = INCHING_PROTOCOL.CMD;
            payloadValue[1] = INCHING_PROTOCOL.SUBCMD_INCHING;
            payloadValue[2] = INCHING_PROTOCOL.PAYLOAD_LENGTH;
            payloadValue[3] = INCHING_PROTOCOL.SEQ_NUM;
            
            payloadValue[4] = 0x00;
            if (enabled) {
                payloadValue[4] |= INCHING_PROTOCOL.FLAG_ENABLE;
            }
            if (mode === 'on') {
                payloadValue[4] |= INCHING_PROTOCOL.FLAG_MODE_ON;
            }
            
            payloadValue[5] = 0x00;
            payloadValue[6] = tmpTime & 0xff;
            payloadValue[7] = (tmpTime >> 8) & 0xff;
            payloadValue[8] = 0x00;
            payloadValue[9] = 0x00;
            
            const checksumLength = payloadValue[2] + 3;
            payloadValue[10] = this._calculateChecksum(payloadValue, checksumLength);
            
            this.log(`Sending inching command:`, {
                enabled,
                mode,
                time_seconds: time,
                payload_hex: Buffer.from(payloadValue).toString('hex')
            });
            
            const cluster = this.zclNode.endpoints[1].clusters['SonoffCluster'];
            if (!cluster) {
                throw new Error(`SonoffCluster not available - cannot set inching`);
            }
            
            const payloadBuffer = Buffer.from(payloadValue);

            await cluster.protocolData(
                { data: payloadBuffer },
                { 
                    disableDefaultResponse: true, 
                    waitForResponse: false,
                    manufacturerSpecific: true,
                    manufacturerId: 0x1286
                }
            );
            
            this.log(`Inching command sent successfully`);
            
        } catch (error) {
            this.error(`Failed to set inching:`, error);
            throw error;
        }
    }

    _calculateChecksum(payload, length) {
        let checksum = 0x00;
        for (let i = 0; i < length; i++) {
            checksum ^= payload[i];
        }
        return checksum;
    }

    async checkAttributes() {
        this.readAttribute(CLUSTER.ON_OFF, ['powerOnBehavior'], (data) => {
            if (data && data.powerOnBehavior !== undefined) {
                this.log(`Read powerOnBehavior:`, data.powerOnBehavior);
                this.setSettings({ power_on_behavior: data.powerOnBehavior })
                    .catch(err => this.error(`Failed to set powerOnBehavior setting:`, err));
            } else {
                this.log(`powerOnBehavior not available in response`);
            }
        });
        
        this.readAttribute(SonoffCluster, SonoffCluster.ZBMINIR2_ATTRIBUTES, (data) => {
            this.log(`Read SonoffCluster attributes:`, data);
            
            const settingsData = { ...data };
            
            if (settingsData.TurboMode !== undefined) {
                const rawValue = settingsData.TurboMode;
                const boolValue = this._parseTurboMode(rawValue);
                
                this.log(`TurboMode from device: raw=0x${rawValue.toString(16)} (${rawValue}) → boolean=${boolValue}`);
                settingsData.TurboMode = boolValue;
            }

            if (settingsData.switch_mode !== undefined) {
                const rawValue = settingsData.switch_mode;
                const stringValue = this._parseSwitchMode(rawValue);
                
                this.log(`switch_mode from device: raw=${rawValue} → string="${stringValue}"`);
                settingsData.switch_mode = stringValue;
            }
            
            this.setSettings(settingsData)
                .then(() => this.log(`Device settings initialized successfully`))
                .catch(err => this.error(`Error initializing settings:`, err));
        });
    }

    async onDeleted() {
        this.log(`ZBMINIR2 switch removed`);
        
        const sonoffCluster = this.zclNode?.endpoints?.[1]?.clusters?.SonoffCluster;
        if (sonoffCluster) {
            sonoffCluster.removeAllListeners('protocolDataResponse');
        }
        
        if (this._verifyTimeout) {
            clearTimeout(this._verifyTimeout);
            this._verifyTimeout = null;
        }
        
        await super.onDeleted();
    }

}

module.exports = SonoffZBMINIR2;
