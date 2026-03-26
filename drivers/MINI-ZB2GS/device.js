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
     * @param {Function} onToggle - Callback invoked when the physical button sends a toggle.
     */
    constructor(node, onToggle) {
        super();
        this.node = node;
        this._onToggle = onToggle;
    }

    /** Called by the Zigbee stack when the physical button sends a toggle command. */
    toggle() {
        if (typeof this._onToggle === 'function') {
            this._onToggle();
        }
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
        this.log(`MINI-ZB2GS Channel ${ep} initializing (Device ID: ${this.getData().id})`);

        if (this.zclNode && this.zclNode.endpoints[ep]) {
            this.log(`Endpoint ${ep} exists. Clusters:`, Object.keys(this.zclNode.endpoints[ep].clusters));
        } else {
            this.error(`CRITICAL: Endpoint ${ep} NOT FOUND on zclNode!`);
        }

        if (this.hasCapability('onoff')) {
            this.log(`Registering onoff capability for endpoint ${ep}`);
            // registerCapability sets up attribute report listeners (device -> UI) and proper Zigbee command handling.
            // This is required for the UI to update when the physical button is pressed.
            this.registerCapability('onoff', CLUSTER.ON_OFF, {
                endpoint: ep,
            });

            // Override the outgoing command listener to handle virtual mode.
            // registerCapabilityListener called after registerCapability replaces
            // only the outgoing direction (UI -> device), keeping attribute reporting intact.
            this.registerCapabilityListener('onoff', async (value, opts) => {
                const detachModeStr = this.getSetting('detach_mode');

                // Virtual switch mode: fire the Flow trigger and skip the Zigbee command.
                if (detachModeStr === 'on_button_switch') {
                    const clickTrigger = this.homey.flow.getDeviceTriggerCard("MINI-ZB2GS:click");
                    if (clickTrigger) {
                        clickTrigger.trigger(this, {}, {}).catch(this.error);
                    }
                    return;
                }

                // Normal mode: Send the command through the root device's zclNode context to ensure
                // that when the Zigbee response arrives homey delivers it to the root ZCL context, 
                // resolving the transaction handler properly (prevents timeout on sub-devices).
                const targetZclNode = ep === 1 ? this.zclNode : this.getSiblingDevice()?.zclNode;
                if (!targetZclNode) {
                    this.error(`Cannot send on/off command: target ZCL node not found for endpoint ${ep}`);
                    return;
                }

                if (value) {
                    return targetZclNode.endpoints[ep].clusters.onOff.setOn().catch(this.error);
                } else {
                    return targetZclNode.endpoints[ep].clusters.onOff.setOff().catch(this.error);
                }
            });
        }

        // Do NOT call configureAttributeReporting — device auto-reports from both endpoints.
        // Calling it on endpoint 2 causes a timeout that corrupts that cluster's internal state.

        // Method to handle a physical toggle event for a specific device instance
        const triggerToggleForDevice = (targetDevice) => {
            const detachMode = targetDevice.getSetting('detach_mode');
            const ep = targetDevice.endpointId;

            if (detachMode === 'on_button' || detachMode === 'on_button_switch') {
                targetDevice.log(`Triggering 'click' flow for channel ${targetDevice.channelIndex + 1}`);
                const clickTrigger = targetDevice.homey.flow.getDeviceTriggerCard("MINI-ZB2GS:click");
                if (clickTrigger) {
                    clickTrigger.trigger(targetDevice, {}, {}).catch(targetDevice.error);
                }
            }

            if (detachMode === 'on_button_switch') {
                const current = targetDevice.getCapabilityValue('onoff');
                targetDevice.setCapabilityValue('onoff', !current).catch(targetDevice.error);
            }
        };

        try {
            this.zclNode.endpoints[ep].bind(CLUSTER.ON_OFF.NAME, new MyOnOffBoundCluster(this, () => triggerToggleForDevice(this)));
        } catch (e) {
            this.error(`FAILED to bind endpoint ${ep}:`, e.message);
        }

        // Ensure endpoint 2 binding is active via Root (safety measure for dual-channel)
        if (ep === 1) {
            const sibling = this.getSiblingDevice();
            if (sibling && this.zclNode.endpoints[2]) {
                try {
                    this.zclNode.endpoints[2].bind(CLUSTER.ON_OFF.NAME, new MyOnOffBoundCluster(sibling, () => {
                        triggerToggleForDevice(sibling);
                    }));
                } catch (e) {
                    this.log(`Notice: Proactive binding of ep2 failed:`, e.message);
                }
            }
        }


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
                    settings.inching_mode || 'on',
                    this.channelIndex
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
                const targetZclNode = ep === 1 ? this.zclNode : this.getSiblingDevice()?.zclNode;
                if (targetZclNode) {
                    await targetZclNode.endpoints[ep].clusters.onOff.writeAttributes({
                        powerOnBehavior: newSettings.power_on_behavior
                    });
                }
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
                const isDetached = newSettings.detach_mode === true ||
                    newSettings.detach_mode === 'on_button' ||
                    newSettings.detach_mode === 'on_button_switch';
                await this.updateDetachRelay(isDetached);
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
                    newSettings.inching_mode,
                    this.channelIndex
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
        this.log(`[DetachRelay] Updating for channel ${this.endpointId}: ${enabled}`);

        // Zigbee responses always arrive on the root device's cluster instance.
        // If we are the sub-device (channel 2), delegate to the root (channel 1) to
        // ensure _trxHandlers are registered on the right zclNode.
        const handler = this.endpointId === 1 ? this : this.getSiblingDevice();
        if (!handler) {
            this.error('[DetachRelay] Cannot update: root device (channel 1) not found.');
            return;
        }

        return new Promise((resolve, reject) => {
            handler.readAttribute(SonoffCluster, ['detach_relay_mode2'], (data) => {
                this.log(`[DetachRelay] Current bitmap data:`, data);

                if (!data || typeof data.detach_relay_mode2 !== 'number') {
                    const msg = '[DetachRelay] Invalid data received for detach_relay_mode2';
                    this.error(msg, data);
                    return reject(new Error(msg));
                }

                const bitmap = data.detach_relay_mode2;
                const bitMask = 1 << this.channelIndex; // ch1 → bit0, ch2 → bit1
                const newBitmap = enabled ? (bitmap | bitMask) : (bitmap & ~bitMask);

                this.log(`[DetachRelay] bitmap=0x${bitmap.toString(16)} mask=0x${bitMask.toString(16)} new=0x${newBitmap.toString(16)}`);

                if (newBitmap === bitmap) {
                    this.log(`[DetachRelay] Bitmap already correct, no write needed.`);
                    return resolve();
                }

                handler.writeAttributes(SonoffCluster, { detach_relay_mode2: newBitmap })
                    .then(() => {
                        this.log(`[DetachRelay] Update successful for channel ${this.endpointId}`);
                        resolve();
                    })
                    .catch((err) => {
                        this.error('[DetachRelay] Write failed:', err);
                        reject(err);
                    });
            });
        });
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

            const targetZclNode = this.endpointId === 1 ? this.zclNode : this.getSiblingDevice()?.zclNode;
            if (!targetZclNode) {
                this.error(`Cannot write attributes: target ZCL node not found for endpoint ${endpointId}`);
                return;
            }

            const clust = targetZclNode.endpoints[endpointId].clusters[clusterName];
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

            this.log(`Write attributes sequentially to endpoint ${endpointId}`, items);
            const results = [];
            for (const [key, value] of Object.entries(items)) {
                try {
                    this.log(`Writing single attribute to endpoint ${endpointId}: { ${key}: ${value} }`);
                    const res = await clust.writeAttributes({ [key]: value });
                    results.push(res);
                } catch (err) {
                    this.error(`Error writing single attribute ${key} to endpoint ${endpointId}:`, err);
                    throw err; // Fail fast if one attribute fails
                }
            }
            return Object.keys(items).length === 1 ? results[0] : results;
        } catch (error) {
            this.error("Error writing attrs sequentially to endpoint", endpointId, items, error);
            throw error;
        }
    }



    /**
     * Register listeners on incoming attribute reports to keep settings in sync.
     * The device auto-reports attributes from both endpoints shortly after connection,
     * so this reliably populates settings for both channel 1 and channel 2.
     */
    registerAttributeReportListeners() {
        const ep = this.endpointId;
        this.log(`Registering listeners for Channel ${ep}`);

        if (!this.zclNode.endpoints[ep]) {
            this.error(`Cannot register listeners: Endpoint ${ep} missing`);
            return;
        }

        // (Debug listeners on raw frames removed in production version)

        // Per-channel: onOff cluster on this endpoint.
        // The sub-device (ep === 2) already has its onOff capability handled by registerCapability,
        // but we still register a manual listener here to ensure UI updates are received
        // since the SDK may not route ep2 attribute reports to the sub-device instance.
        let onOffCluster = this.zclNode.endpoints[ep].clusters.onOff;
        if (!onOffCluster && typeof CLUSTER.ON_OFF === 'function') {
            this.log(`Manually instantiating onOff cluster for endpoint ${ep}`);
            onOffCluster = new CLUSTER.ON_OFF(this.zclNode.endpoints[ep]);
            this.zclNode.endpoints[ep].clusters.onOff = onOffCluster;
        }
        this.log(`onOffCluster for Channel ${ep}:`, onOffCluster ? 'found' : 'NOT FOUND');

        if (onOffCluster) {
            onOffCluster.on('attr.onOff', (value) => {
                this.log(`[Channel ${ep}] onOff report received: `, value);
                // Note: setCapabilityValue('onoff') is omitted here because:
                // 1. For Channel 1: registerCapability() already handles it automatically.
                // 2. For Channel 2: The Proxy in the Root Device instance handles it because
                //    the SDK often fails to route the report to this sub-device instance.
            });
            onOffCluster.on('attr.powerOnBehavior', (value) => {
                const current = this.getSetting('power_on_behavior');
                if (current !== value) {
                    this.setSettings({ power_on_behavior: value }).catch(this.error);
                }
            });
        }

        // ROOT DEVICE ONLY: proxy ep2 onOff reports to the Channel 2 sibling.
        // The SDK routes Zigbee frames to a single ZCLNode shared by both device instances.
        // Attribute reports for ep2 do not always fire on the sub-device's own listeners,
        // so we register a proxy here on ep1 (root) to ensure the sibling UI stays in sync.
        if (ep === 1) {
            this.log(`[Proxy] Setting up ep2 → sibling proxy listener`);
            const ep2Endpoint = this.zclNode.endpoints[2];
            if (ep2Endpoint) {
                let ep2OnOffCluster = ep2Endpoint.clusters.onOff;
                if (!ep2OnOffCluster && typeof CLUSTER.ON_OFF === 'function') {
                    this.log(`[Proxy] Manually instantiating onOff cluster for endpoint 2`);
                    ep2OnOffCluster = new CLUSTER.ON_OFF(ep2Endpoint);
                    ep2Endpoint.clusters.onOff = ep2OnOffCluster;
                }
                this.log(`[Proxy] ep2 onOffCluster:`, ep2OnOffCluster ? 'found' : 'NOT FOUND');
                if (ep2OnOffCluster) {
                    ep2OnOffCluster.on('attr.onOff', (value) => {
                        this.log(`[Proxy Channel 2] onOff report received: `, value);
                        const sibling = this.getSiblingDevice();
                        if (sibling) {
                            this.log(`[Proxy Channel 2] Updating sibling device UI to: `, !!value);
                            sibling.setCapabilityValue('onoff', !!value).catch(this.error);
                        } else {
                            this.error(`[Proxy Channel 2] Sibling device NOT FOUND`);
                        }
                    });
                    this.log(`[Proxy] ep2 attr.onOff listener registered successfully`);
                }
            } else {
                this.error(`[Proxy] Endpoint 2 NOT FOUND on zclNode`);
            }
        }

        // Per-channel: SonoffCluster on this endpoint
        const sonoffCluster = this.zclNode.endpoints[ep].clusters['SonoffCluster'];
        if (sonoffCluster) {
            sonoffCluster.on('attr.switch_mode', (value) => {
                const valStr = String(value);
                if (this.getSetting('switch_mode') !== valStr) {
                    this.setSettings({ switch_mode: valStr }).catch(this.error);
                }
            });
            sonoffCluster.on('attr.power_on_delay_state', (value) => {
                const valBool = Boolean(value);
                if (this.getSetting('power_on_delay_state') !== valBool) {
                    this.setSettings({ power_on_delay_state: valBool }).catch(this.error);
                }
            });
            sonoffCluster.on('attr.power_on_delay_time', (value) => {
                // Raw value is in 0.5s units (scale: 2); convert to seconds for UI
                const valSec = value / 2;
                if (this.getSetting('power_on_delay_time') !== valSec) {
                    this.setSettings({ power_on_delay_time: valSec }).catch(this.error);
                }
            });
        }

        // Global attributes live on endpoint 1 — both channel instances need to
        // watch ep1 reports and extract their own values.
        const ep1Sonoff = this.zclNode.endpoints[1].clusters['SonoffCluster'];
        if (ep1Sonoff) {
            ep1Sonoff.on('attr.TurboMode', (value) => {
                // Device reports int16: 20 = on, 9 = off (other values treated as off)
                const valBool = value === 20;
                if (this.getSetting('TurboMode') !== valBool) {
                    this.setSettings({ TurboMode: valBool }).catch(this.error);
                }
            });
            ep1Sonoff.on('attr.network_led', (value) => {
                const valBool = value !== 0;
                if (this.getSetting('network_led') !== valBool) {
                    this.setSettings({ network_led: valBool }).catch(this.error);
                }
            });
            ep1Sonoff.on('attr.detach_relay_mode2', (value) => {
                // value is a plain number (bitmap8): bit0=ch1, bit1=ch2
                const isDetached = typeof value === 'number' && ((value >> this.channelIndex) & 1) !== 0;
                const currentDetachMode = this.getSetting('detach_mode');

                let newMode = 'off';
                if (isDetached) {
                    newMode = currentDetachMode === 'on_button_switch' ? 'on_button_switch' : 'on_button';
                }

                this.setSettings({ detach_mode: newMode }).catch(this.error);
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
        this.log(`[checkAttributes] Reading powerOnBehavior from endpoint ${ep}`);
        try {
            const data = await this.zclNode.endpoints[ep].clusters.onOff.readAttributes(['powerOnBehavior']);
            if (data && data.powerOnBehavior !== undefined) {
                await this.setSettings({ power_on_behavior: data.powerOnBehavior });
            }
        } catch (e) {
            this.error(`[checkAttributes] Error reading powerOnBehavior from ep ${ep}:`, e.message);
        }

        // Read per-channel SonoffCluster attributes one by one
        const perChannelAttrs = ['switch_mode', 'power_on_delay_state', 'power_on_delay_time'];
        this.log(`[checkAttributes] Reading per-channel attributes from endpoint ${ep}`);
        for (const attrName of perChannelAttrs) {
            try {
                const data = await this.zclNode.endpoints[ep].clusters['SonoffCluster'].readAttributes(attrName);
                if (data && data[attrName] !== undefined) {
                    const settingsData = {};
                    if (attrName === 'switch_mode') settingsData.switch_mode = String(data.switch_mode);
                    else if (attrName === 'power_on_delay_state') settingsData.power_on_delay_state = Boolean(data.power_on_delay_state);
                    else if (attrName === 'power_on_delay_time') settingsData.power_on_delay_time = data.power_on_delay_time / 2;
                    await this.setSettings(settingsData);
                }
            } catch (e) {
                this.error(`[checkAttributes] Error reading ${attrName} from ep ${ep}:`, e.message);
            }
        }

        // Read global attributes (from endpoint 1)
        this.log(`[checkAttributes] Reading global attributes from endpoint 1`);
        const globalAttrs = ['TurboMode', 'network_led', 'detach_relay_mode2'];
        for (const attrName of globalAttrs) {
            try {
                const data = await this.zclNode.endpoints[1].clusters['SonoffCluster'].readAttributes(attrName);
                if (data && data[attrName] !== undefined) {
                    if (attrName === 'TurboMode') await this.setSettings({ TurboMode: data.TurboMode === 20 });
                    else if (attrName === 'network_led') await this.setSettings({ network_led: Boolean(data.network_led) });
                    else if (attrName === 'detach_relay_mode2') {
                        const isDetached = ((data.detach_relay_mode2 >> this.channelIndex) & 1) !== 0;
                        const currentDetachMode = this.getSetting('detach_mode');
                        let newMode = 'off';
                        if (isDetached) {
                            newMode = currentDetachMode === 'on_button_switch' ? 'on_button_switch' : 'on_button';
                        }
                        await this.setSettings({ detach_mode: newMode });
                    }
                }
            } catch (e) {
                this.error(`[checkAttributes] Error reading ${attrName} from ep 1:`, e.message);
            }
        }
    }

    async onDeleted() {
        this.log(`MINI-ZB2GS channel ${this.endpointId} removed`);
    }

    /**
     * Returns the sibling device (the other channel of the same physical unit).
     * Both sub-devices share the same ZCLNode instance, so we match on that reference.
     */
    getSiblingDevice() {
        const myNodeId = this.zclNode?.endpoint?.node?.netAddress || this.getData()?.id;
        const sibling = this.driver.getDevices().find(device => {
            if (device === this) return false;
            const otherNodeId = device.zclNode?.endpoint?.node?.netAddress || device.getData()?.id;
            return otherNodeId === myNodeId;
        });

        if (!sibling) {
            this.log(`[getSiblingDevice] No sibling found. My Node ID: ${myNodeId}, Devices online: ${this.driver.getDevices().length}`);
        }
        return sibling;
    }
}

module.exports = SonoffMINIZB2GS;
