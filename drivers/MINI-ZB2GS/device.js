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
        this._click = node.homey.flow.getDeviceTriggerCard("MINI-ZB2GS:click");
    }
    toggle() {
        this._click.trigger(this.node, {}, {}).catch(this.node.error);
    }
}

// Global attributes (always written to/read from endpoint 1)
const SonoffClusterGlobalAttributes = [
    'TurboMode',
    'network_led',
];

// Per-channel attributes (written to/read from the device's own endpoint)
const SonoffClusterPerChannelAttributes = [
    'switch_mode',
    'power_on_delay_state',
    'power_on_delay_time',
];

class SonoffMINIZB2GS extends SonoffBase {

    /**
     * Returns the Zigbee endpoint ID for this channel.
     * Root device = endpoint 1 (channel 1)
     * Sub-device "secondChannel" = endpoint 2 (channel 2)
     */
    get endpointId() {
        const { subDeviceId } = this.getData();
        return subDeviceId === 'secondChannel' ? 2 : 1;
    }

    /**
     * Returns the 0-based channel index (0 for channel 1, 1 for channel 2).
     * Used for inching operations.
     */
    get channelIndex() {
        return this.endpointId - 1;
    }

    async onNodeInit({ zclNode }) {
        super.onNodeInit({ zclNode });

        const ep = this.endpointId;
        this.log(`MINI-ZB2GS Channel ${ep} initializing`);

        if (this.hasCapability('onoff')) {
            this.registerCapability('onoff', CLUSTER.ON_OFF, {
                endpoint: ep,
            });
        }

        // Do NOT call configureAttributeReporting — device auto-reports from both endpoints.
        // Calling it on endpoint 2 causes a timeout that corrupts that cluster's internal state.

        // Bind toggle command from external switch
        this.zclNode.endpoints[ep].bind(CLUSTER.ON_OFF.NAME, new MyOnOffBoundCluster(this));

        // Register listeners on incoming attribute reports to keep settings in sync.
        // This is the primary sync mechanism for ep2 (active reads on ep2 time out).
        // For ep1 we also call checkAttributes() as initial read attempt.
        this.registerAttributeReportListeners();

        // Active read only for channel 1: device can handle reads from ep1 reliably.
        // Channel 2 relies entirely on auto-reported attributes.
        if (ep === 1) {
            this.checkAttributes();
        }

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
        const ep = this.endpointId;

        // Power-on behavior (per channel, on genOnOff cluster)
        if (changedKeys.includes("power_on_behavior")) {
            try {
                await this.zclNode.endpoints[ep].clusters.onOff.writeAttributes({
                    powerOnBehavior: newSettings.power_on_behavior
                });
            } catch (error) {
                this.log("Error updating the power on behavior");
            }
        }

        // Global attributes (always endpoint 1)
        // Convert TurboMode boolean checkbox → int16 expected by device (20=on, 9=off)
        const globalSettings = { ...newSettings };
        if (globalSettings.TurboMode !== undefined) {
            globalSettings.TurboMode = globalSettings.TurboMode ? 20 : 9;
        }
        await this.writeAttributesOnEndpoint(1, SonoffCluster, globalSettings, changedKeys, SonoffClusterGlobalAttributes).catch(this.error);

        // Sync global setting values to the sibling device's UI so both channels stay aligned.
        // The hardware has a single radio/LED shared by all channels — writing from either channel
        // changes the physical value, but the other channel's settings panel would still show the
        // old value until the next auto-report. We push the new value immediately instead.
        const globalChanged = SonoffClusterGlobalAttributes.filter(k => changedKeys.includes(k));
        if (globalChanged.length > 0) {
            const sibling = this.getSiblingDevice();
            if (sibling) {
                const syncData = {};
                for (const key of globalChanged) syncData[key] = newSettings[key];
                sibling.setSettings(syncData).catch(this.error);
            }
        }

        // Per-channel attributes (on this device's endpoint)
        // Coerce switch_mode from dropdown string ("0","1","2","130") to number for uint8 attribute
        // Convert power_on_delay_time from seconds (UI) to 0.5s units for wire (scale: 2)
        const perChannelSettings = { ...newSettings };
        if (perChannelSettings.switch_mode !== undefined) {
            perChannelSettings.switch_mode = parseInt(perChannelSettings.switch_mode, 10);
        }
        if (perChannelSettings.power_on_delay_time !== undefined) {
            perChannelSettings.power_on_delay_time = Math.round(perChannelSettings.power_on_delay_time * 2);
        }
        await this.writeAttributesOnEndpoint(ep, SonoffCluster, perChannelSettings, changedKeys, SonoffClusterPerChannelAttributes).catch(this.error);

        // Handle detach relay mode (bitmap on endpoint 1)
        if (changedKeys.includes('detach_mode')) {
            try {
                await this.updateDetachRelay(newSettings.detach_mode);
            } catch (error) {
                this.error('Error updating detach relay mode:', error);
            }
        }

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
     * Update this channel's detach relay bit in the bitmap.
     * Reads the current bitmap, modifies the relevant bit, and writes back.
     */
    async updateDetachRelay(enabled) {
        try {
            let bitmap = 0;
            try {
                const data = await this.zclNode.endpoints[1].clusters['SonoffCluster']
                    .readAttributes('detach_relay_mode2');
                if (typeof data.detach_relay_mode2 === 'number') bitmap = data.detach_relay_mode2;
            } catch (e) {
                this.log('Could not read current detach relay bitmap, using 0');
            }

            const bitMask = 1 << this.channelIndex; // ch1 → bit0, ch2 → bit1
            bitmap = enabled ? (bitmap | bitMask) : (bitmap & ~bitMask);

            await this.zclNode.endpoints[1].clusters['SonoffCluster']
                .writeAttributes({ detach_relay_mode2: bitmap });

            this.log(`Detach relay updated: channel${this.endpointId}=${enabled}, bitmap=0x${bitmap.toString(16)}`);
        } catch (error) {
            this.error('Error updating detach relay:', error);
            throw error;
        }
    }

    /**
     * Set inching (auto-off/on) configuration for this channel.
     * @param {boolean} enabled - Enable or disable inching
     * @param {number} time - Time in seconds (0.5-3599.5)
     * @param {string} mode - 'on' (turn ON then OFF) or 'off' (turn OFF then ON)
     */
    async setInching(enabled = false, time = 1, mode = 'on') {
        try {
            const msTime = Math.round(time * 1000);
            const rawTimeUnits = Math.round(msTime / 500);
            const tmpTime = Math.min(Math.max(rawTimeUnits, 1), 0xffff);

            const payloadValue = [];
            payloadValue[0] = 0x01;  // Cmd
            payloadValue[1] = 0x17;  // SubCmd - INCHING
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

            // Byte 5: Channel (0 = channel 1, 1 = channel 2)
            payloadValue[5] = this.channelIndex;

            // Byte 6-7: Timeout (little-endian, in 0.5s units)
            payloadValue[6] = tmpTime & 0xff;
            payloadValue[7] = (tmpTime >> 8) & 0xff;

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
                channel: this.channelIndex,
                time_seconds: time,
                time_half_seconds: tmpTime,
                payload_hex: Buffer.from(payloadValue).toString('hex')
            });

            const cluster = this.zclNode.endpoints[1].clusters['SonoffCluster'];
            const payloadBuffer = Buffer.from(payloadValue);

            await cluster.protocolData(
                { data: payloadBuffer },
                { disableDefaultResponse: true, waitForResponse: false }
            );

            this.log('Inching command sent successfully for channel', this.channelIndex);
        } catch (error) {
            this.error('Failed to set inching:', error);
            throw error;
        }
    }

    /**
     * Write attributes to a specific endpoint, filtering by allowed keys.
     */
    async writeAttributesOnEndpoint(endpointId, cluster, attribs, changedKeys = null, allowedKeys = null) {
        let items = {};
        try {
            let clusterName = cluster;
            if (typeof cluster === 'function' || (typeof cluster === 'object' && "NAME" in cluster)) {
                clusterName = cluster.NAME;
            }
            const clust = this.zclNode.endpoints[endpointId].clusters[clusterName];
            if (!clust) {
                this.log(`Cluster ${clusterName} not found on endpoint ${endpointId}`);
                return;
            }

            for (const key in attribs) {
                if (changedKeys && !changedKeys.includes(key)) continue;
                if (allowedKeys && !allowedKeys.includes(key)) continue;
                if (!(key in clust.constructor.attributes)) continue;
                items[key] = attribs[key];
            }

            if (!Object.keys(items).length) return;

            this.log("Write attributes to endpoint", endpointId, items);
            return await clust.writeAttributes(items);
        } catch (error) {
            this.error("Error writing attrs to endpoint", endpointId, items, error);
            throw error;
        }
    }

    /**
     * Read attributes from a specific endpoint.
     */
    async readAttributeOnEndpoint(endpointId, cluster, attr, handler) {
        let clusterName = cluster;
        if (typeof cluster === 'function' || (typeof cluster === 'object' && "NAME" in cluster)) {
            clusterName = cluster.NAME;
        }
        if (!Array.isArray(attr)) attr = [attr];

        try {
            this.log("Read attributes from endpoint", endpointId, attr);
            const clust = this.zclNode.endpoints[endpointId].clusters[clusterName];
            if (!clust) {
                this.log(`Cluster ${clusterName} not found on endpoint ${endpointId}`);
                return;
            }
            clust.readAttributes(...attr)
                .then((value) => {
                    this.log("Got attr from endpoint", endpointId, attr, value);
                    handler(value);
                })
                .catch((e) => {
                    this.error("Error reading attr from endpoint", endpointId, attr, e);
                });
        } catch (error) {
            this.error('Error (outer) reading from endpoint', endpointId, attr, error);
        }
    }

    /**
     * Register listeners on incoming attribute reports to keep settings in sync.
     * The device auto-reports attributes from both endpoints shortly after connection,
     * so this reliably populates settings for both channel 1 and channel 2.
     */
    registerAttributeReportListeners() {
        const ep = this.endpointId;

        // Per-channel: onOff cluster on this endpoint
        const onOffCluster = this.zclNode.endpoints[ep].clusters.onOff;
        if (onOffCluster) {
            onOffCluster.on('attr.onOff', (value) => {
                this.setCapabilityValue('onoff', !!value).catch(this.error);
            });
            onOffCluster.on('attr.powerOnBehavior', (value) => {
                this.setSettings({ power_on_behavior: value }).catch(this.error);
            });
        }

        // Per-channel: SonoffCluster on this endpoint
        const sonoffCluster = this.zclNode.endpoints[ep].clusters['SonoffCluster'];
        if (sonoffCluster) {
            sonoffCluster.on('attr.switch_mode', (value) => {
                this.setSettings({ switch_mode: String(value) }).catch(this.error);
            });
            sonoffCluster.on('attr.power_on_delay_state', (value) => {
                this.setSettings({ power_on_delay_state: Boolean(value) }).catch(this.error);
            });
            sonoffCluster.on('attr.power_on_delay_time', (value) => {
                // Raw value is in 0.5s units (scale: 2); convert to seconds for UI
                this.setSettings({ power_on_delay_time: value / 2 }).catch(this.error);
            });
        }

        // Global attributes live on endpoint 1 — both channel instances need to
        // watch ep1 reports and extract their own values.
        const ep1Sonoff = this.zclNode.endpoints[1].clusters['SonoffCluster'];
        if (ep1Sonoff) {
            ep1Sonoff.on('attr.TurboMode', (value) => {
                // Device reports int16: 20 = on, 9 = off (other values treated as off)
                this.setSettings({ TurboMode: value === 20 }).catch(this.error);
            });
            ep1Sonoff.on('attr.network_led', (value) => {
                this.setSettings({ network_led: value !== 0 }).catch(this.error);
            });
            ep1Sonoff.on('attr.detach_relay_mode2', (value) => {
                // value is a plain number (bitmap8): bit0=ch1, bit1=ch2
                const isDetached = typeof value === 'number' && ((value >> this.channelIndex) & 1) !== 0;
                this.setSettings({ detach_mode: isDetached }).catch(this.error);
            });
        }
    }

    /**
     * Check and sync device attributes from the Zigbee device (active read).
     * Only called for channel 1 — channel 2 relies on registerAttributeReportListeners.
     */
    async checkAttributes() {
        const ep = this.endpointId;

        // Read power-on behavior from this channel's endpoint
        this.readAttributeOnEndpoint(ep, CLUSTER.ON_OFF, ['powerOnBehavior'], (data) => {
            if (data.powerOnBehavior !== undefined) {
                this.setSettings({ power_on_behavior: data.powerOnBehavior }).catch(this.error);
            }
        });

        // Read per-channel SonoffCluster attributes from this endpoint
        this.readAttributeOnEndpoint(ep, SonoffCluster, SonoffClusterPerChannelAttributes, (data) => {
            const settingsData = {};
            if (data.switch_mode !== undefined) settingsData.switch_mode = String(data.switch_mode);
            if (data.power_on_delay_state !== undefined) settingsData.power_on_delay_state = Boolean(data.power_on_delay_state);
            // Raw value is in 0.5s units (scale: 2); convert to seconds for UI
            if (data.power_on_delay_time !== undefined) settingsData.power_on_delay_time = data.power_on_delay_time / 2;
            if (Object.keys(settingsData).length) {
                this.setSettings(settingsData).catch(this.error);
            }
        });

        // Read global attributes (from endpoint 1)
        this.readAttributeOnEndpoint(1, SonoffCluster, SonoffClusterGlobalAttributes, (data) => {
            const settingsData = {};
            if (data.TurboMode !== undefined) settingsData.TurboMode = data.TurboMode === 20; // 20=on, 9=off
            if (data.network_led !== undefined) settingsData.network_led = Boolean(data.network_led);
            if (Object.keys(settingsData).length) {
                this.setSettings(settingsData).catch(this.error);
            }
        });

        // Read detach relay bitmap from endpoint 1
        // detach_relay_mode2 is a plain number (bitmap8): bit0=ch1, bit1=ch2
        this.readAttributeOnEndpoint(1, SonoffCluster, ['detach_relay_mode2'], (data) => {
            if (data.detach_relay_mode2 !== undefined) {
                const isDetached = ((data.detach_relay_mode2 >> this.channelIndex) & 1) !== 0;
                this.setSettings({ detach_mode: isDetached }).catch(this.error);
            }
        });
    }

    async onDeleted() {
        this.log(`MINI-ZB2GS channel ${this.endpointId} removed`);
    }

    /**
     * Returns the sibling device (the other channel of the same physical unit).
     * Both sub-devices share the same ZCLNode instance, so we match on that reference.
     */
    getSiblingDevice() {
        return this.driver.getDevices().find(
            device => device !== this && device.zclNode === this.zclNode
        );
    }
}

module.exports = SonoffMINIZB2GS;
