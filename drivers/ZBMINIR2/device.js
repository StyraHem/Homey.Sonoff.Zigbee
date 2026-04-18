'use strict';

const { ZigBeeDevice } = require("homey-zigbeedriver");

const SonoffOnOffCluster = require("../../lib/SonoffOnOffCluster");
const { Cluster, CLUSTER, BoundCluster } = require('zigbee-clusters');
Cluster.addCluster(SonoffOnOffCluster);

const SonoffCluster = require("../../lib/SonoffCluster");
Cluster.addCluster(SonoffCluster);

const SonoffBase = require('../sonoffbase');

class MyOnOffBoundCluster extends BoundCluster {
    /**
     * @private
     * @param {object} node - The device instance.
     */
    constructor(node) {
        super();
        this.node = node;
        this._click = node.homey.flow.getDeviceTriggerCard("ZBMINIR2:click");
    }

    /** Called by the Zigbee stack when the physical button sends a toggle command. */
    toggle() {
        if (this._click) {
            this._click.trigger(this.node, {}, {}).catch(this.node.error);
        }
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
      * onNodeInit is called when the device is initialized.
      */
    async onNodeInit({ zclNode }) {
        super.onNodeInit({ zclNode });

        if (this.hasCapability('onoff')) {
            this.registerCapability('onoff', CLUSTER.ON_OFF, {
                endpoint: 1,
            });

            this.registerCapabilityListener('onoff', async (value, opts) => {
                const detachModeStr = this.getSetting('detach_mode');

                // Virtual switch mode
                if (detachModeStr === 'on_button_switch') {
                    const clickTrigger = this.homey.flow.getDeviceTriggerCard("ZBMINIR2:click");
                    if (clickTrigger) {
                        clickTrigger.trigger(this, {}, {}).catch(this.error);
                    }
                    return;
                }

                // Normal mode
                if (value) {
                    return this.zclNode.endpoints[1].clusters.onOff.setOn().catch(this.error);
                } else {
                    return this.zclNode.endpoints[1].clusters.onOff.setOff().catch(this.error);
                }
            });
        }

        // Active binding for physical button
        this.zclNode.endpoints[1].bind(CLUSTER.ON_OFF.NAME, new MyOnOffBoundCluster(this));

        this.checkAttributes();

        // Apply inching settings on initialization
        const settings = this.getSettings();
        if (settings.inching_enabled !== undefined) {
            try {
                await this.setInching(
                    settings.inching_enabled,
                    settings.inching_time || 1,
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
     */
    async onSettings({ oldSettings, newSettings, changedKeys }) {
        // Power-on behavior (genOnOff cluster)
        if (changedKeys.includes("power_on_behavior")) {
            try {
                await this.zclNode.endpoints[1].clusters.onOff.writeAttributes({ 
                    powerOnBehavior: newSettings.power_on_behavior 
                });
            } catch (error) {
                this.log("Error updating the power on behavior");
            }
        }

        // SonoffCluster attributes
        const settingsToWrite = { ...newSettings };
        if (settingsToWrite.TurboMode !== undefined) {
            settingsToWrite.TurboMode = settingsToWrite.TurboMode ? 20 : 9;
        }
        if (settingsToWrite.power_on_delay_time !== undefined) {
            settingsToWrite.power_on_delay_time = Math.round(settingsToWrite.power_on_delay_time * 2);
        }
        if (settingsToWrite.detach_mode !== undefined) {
            settingsToWrite.detach_mode = settingsToWrite.detach_mode === true ||
                                          settingsToWrite.detach_mode === 'on_button' ||
                                          settingsToWrite.detach_mode === 'on_button_switch';
        }

        await this.writeAttributes(SonoffCluster, settingsToWrite, changedKeys).catch(this.error);

        // Handle inching settings changes
        const inchingKeys = ['inching_enabled', 'inching_mode', 'inching_time'];
        if (changedKeys.some(key => inchingKeys.includes(key))) {
            try {
                await this.setInching(
                    newSettings.inching_enabled,
                    newSettings.inching_time,
                    newSettings.inching_mode
                );
            } catch (error) {
                this.error('Error updating inching settings:', error);
                throw new Error('Failed to update inching settings');
            }
        }
    }

    /**
     * Check and sync device attributes from the Zigbee device (active read).
     */
    async checkAttributes() {
        this.readAttribute(CLUSTER.ON_OFF, ['powerOnBehavior'], (data) => {
            if (data && data.powerOnBehavior !== undefined) {
                this.setSettings({ power_on_behavior: data.powerOnBehavior }).catch(this.error);
            }
        });

        this.readAttribute(SonoffCluster, SonoffClusterAttributes, (data) => {
            if (!data) return;

            const currentDetachMode = this.getSetting('detach_mode');
            const isDetached = Boolean(data.detach_mode);
            const newDetachMode = isDetached
                ? (currentDetachMode === 'on_button_switch' ? 'on_button_switch' : 'on_button')
                : 'off';

            const settingsData = {};
            if (data.TurboMode !== undefined) settingsData.TurboMode = data.TurboMode === 20;
            if (data.network_led !== undefined) settingsData.network_led = Boolean(data.network_led);
            if (data.power_on_delay_state !== undefined) settingsData.power_on_delay_state = Boolean(data.power_on_delay_state);
            if (data.power_on_delay_time !== undefined) settingsData.power_on_delay_time = data.power_on_delay_time / 2;
            if (data.switch_mode !== undefined) settingsData.switch_mode = String(data.switch_mode);
            if (data.detach_mode !== undefined) settingsData.detach_mode = newDetachMode;

            if (Object.keys(settingsData).length) {
                this.setSettings(settingsData).catch(this.error);
            }
        });
    }

    async onDeleted() {
        this.log("smartswitch ZBMINIR2 removed");
    }
}

module.exports = SonoffZBMINIR2;
