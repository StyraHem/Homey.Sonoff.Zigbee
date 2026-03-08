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
        this._click = node.homey.flow.getDeviceTriggerCard("MINI-ZB2GS-L:click");
    }
    toggle() {
        this._click.trigger(this.node, {}, {}).catch(this.node.error);
    }
}

// Per-channel attributes (written to/read from the device's own endpoint)
const SonoffClusterPerChannelAttributes = [
    'switch_mode',
    'power_on_delay_state',
    'power_on_delay_time',
];

class SonoffMINIZB2GSL extends SonoffBase {

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
     */
    get channelIndex() {
        return this.endpointId - 1;
    }

    async onNodeInit({ zclNode }) {
        super.onNodeInit({ zclNode });

        const ep = this.endpointId;
        this.log(`MINI-ZB2GS-L Channel ${ep} initializing`);

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

        // Global attribute detach_relay_mode2 lives on endpoint 1 — both channel
        // instances watch ep1 reports and extract their own bit.
        const ep1Sonoff = this.zclNode.endpoints[1].clusters['SonoffCluster'];
        if (ep1Sonoff) {
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
        this.log(`MINI-ZB2GS-L channel ${this.endpointId} removed`);
    }
}

module.exports = SonoffMINIZB2GSL;
