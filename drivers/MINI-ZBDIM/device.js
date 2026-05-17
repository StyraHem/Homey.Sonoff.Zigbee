'use strict';

const SonoffBase = require("../sonoffbase");
const SonoffOnOffCluster = require("../../lib/SonoffOnOffCluster");
const SonoffCluster = require("../../lib/SonoffCluster");
const { Cluster, CLUSTER } = require('zigbee-clusters');

Cluster.addCluster(SonoffOnOffCluster);
Cluster.addCluster(SonoffCluster);

class SonoffMiniZBDim extends SonoffBase {

  async onNodeInit({ zclNode }) {
    super.onNodeInit({ zclNode });

    this.log('MINI-ZBDIM Dimmer initialized');

    // Register On/Off capability
    if (this.hasCapability('onoff')) {
      this.registerCapability('onoff', CLUSTER.ON_OFF);
    }

    // Register Dim capability
    if (this.hasCapability('dim')) {
      this.registerCapability('dim', CLUSTER.LEVEL_CONTROL);
    }

    // Register Power Measurement capabilities
    if (this.hasCapability('measure_power')) {
      this.registerCapability('measure_power', CLUSTER.ELECTRICAL_MEASUREMENT);
    }

    if (this.hasCapability('measure_voltage')) {
      this.registerCapability('measure_voltage', CLUSTER.ELECTRICAL_MEASUREMENT);
    }

    if (this.hasCapability('measure_current')) {
      this.registerCapability('measure_current', CLUSTER.ELECTRICAL_MEASUREMENT);
    }

    // Read attributes on startup
    this.checkAttributes();

    // Register listeners for automatic sync if settings changed physically
    this.registerAttributeReportListeners();

    // Apply inching only if explicitly enabled — the device remembers its own state,
    // so there is no need to send a "disabled" command on every boot.
    const settings = this.getSettings();
    if (settings.inching_enabled === true) {
        this.setInching(
            true,
            settings.inching_time || 1,
            settings.inching_mode || 'on',
            0 // channelIndex 0
        ).then(() => {
            this.log('Initial inching settings applied');
        }).catch(error => {
            this.log('Could not apply initial inching settings (device might be offline):', error.message);
        });
    }
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log("Settings changed:", changedKeys);

    // Power-on behavior
    if (changedKeys.includes("power_on_behavior")) {
      try {
        await this.zclNode.endpoints[1].clusters.onOff.writeAttributes({
          powerOnBehavior: newSettings.power_on_behavior
        });
      } catch (error) {
        this.error("Error updating power on behavior:", error.message);
      }
    }

    // Dimming and switch settings (SonoffCluster)
    const sonoffSettings = {};

    if (changedKeys.includes('switch_mode')) {
        sonoffSettings.switch_mode = parseInt(newSettings.switch_mode, 10);
    }

    if (changedKeys.includes('min_brightness_threshold')) {
        sonoffSettings.min_brightness_threshold = Math.round((newSettings.min_brightness_threshold * 255) / 100);
    }

    if (changedKeys.includes('max_brightness_threshold')) {
        sonoffSettings.max_brightness_threshold = Math.round((newSettings.max_brightness_threshold * 255) / 100);
    }

    if (changedKeys.includes('dimming_light_rate')) {
        sonoffSettings.dimming_light_rate = parseInt(newSettings.dimming_light_rate, 10);
    }

    if (changedKeys.includes('transition_time')) {
        // App transition time in Z2M is scaled by 10 (0.1s increments)
        sonoffSettings.transition_time = Math.round(newSettings.transition_time * 10);
    }

    if (Object.keys(sonoffSettings).length > 0) {
        try {
            await this.zclNode.endpoints[1].clusters['SonoffCluster'].writeAttributes(sonoffSettings);
            this.log('SonoffCluster attributes written:', sonoffSettings);
        } catch (err) {
            this.error('Error writing SonoffCluster settings:', err.message);
        }
    }

    // Inching settings
    const inchingKeys = ['inching_enabled', 'inching_mode', 'inching_time'];
    const inchingChanged = changedKeys.some(key => inchingKeys.includes(key));

    if (inchingChanged) {
        try {
            await this.setInching(
                newSettings.inching_enabled,
                newSettings.inching_time,
                newSettings.inching_mode,
                0 // channelIndex 0
            );
            this.log('Inching settings updated');
        } catch (error) {
            this.error('Error updating inching settings:', error.message);
        }
    }
  }

  async checkAttributes() {
    // Read powerOnBehavior first — if this fails the device is offline, abort immediately.
    try {
        const data = await this.zclNode.endpoints[1].clusters.onOff.readAttributes(['powerOnBehavior']);
        if (data && data.powerOnBehavior !== undefined) {
            await this.setSettings({ power_on_behavior: data.powerOnBehavior });
        }
    } catch (e) {
        this.log(`Device offline at startup, skipping attribute sync:`, e.message);
        return; // Abort — no point trying further reads
    }

    // Device is reachable: read all SonoffCluster attributes in a single batch call
    const attrsToRead = [
        'switch_mode',
        'min_brightness_threshold',
        'max_brightness_threshold',
        'dimming_light_rate',
        'transition_time'
    ];

    try {
        const data = await this.zclNode.endpoints[1].clusters['SonoffCluster'].readAttributes(attrsToRead);
        if (!data) return;

        const settingsData = {};
        if (data.switch_mode !== undefined) settingsData.switch_mode = String(data.switch_mode);
        if (data.dimming_light_rate !== undefined) settingsData.dimming_light_rate = String(data.dimming_light_rate);
        if (data.min_brightness_threshold !== undefined) settingsData.min_brightness_threshold = Math.round((data.min_brightness_threshold * 100) / 255);
        if (data.max_brightness_threshold !== undefined) settingsData.max_brightness_threshold = Math.round((data.max_brightness_threshold * 100) / 255);
        if (data.transition_time !== undefined) settingsData.transition_time = data.transition_time / 10;

        if (Object.keys(settingsData).length > 0) {
            await this.setSettings(settingsData);
        }
    } catch (e) {
        this.log(`Could not read SonoffCluster attributes:`, e.message);
    }
  }

  registerAttributeReportListeners() {
    const onOffCluster = this.zclNode.endpoints[1].clusters.onOff;
    if (onOffCluster) {
        onOffCluster.on('attr.powerOnBehavior', (value) => {
            if (this.getSetting('power_on_behavior') !== value) {
                this.setSettings({ power_on_behavior: value }).catch(this.error);
            }
        });
    }

    const sonoffCluster = this.zclNode.endpoints[1].clusters['SonoffCluster'];
    if (sonoffCluster) {
        sonoffCluster.on('attr.switch_mode', (value) => {
            const valStr = String(value);
            if (this.getSetting('switch_mode') !== valStr) {
                this.setSettings({ switch_mode: valStr }).catch(this.error);
            }
        });
        sonoffCluster.on('attr.dimming_light_rate', (value) => {
            const valStr = String(value);
            if (this.getSetting('dimming_light_rate') !== valStr) {
                this.setSettings({ dimming_light_rate: valStr }).catch(this.error);
            }
        });
        sonoffCluster.on('attr.min_brightness_threshold', (value) => {
            const valPct = Math.round((value * 100) / 255);
            if (this.getSetting('min_brightness_threshold') !== valPct) {
                this.setSettings({ min_brightness_threshold: valPct }).catch(this.error);
            }
        });
        sonoffCluster.on('attr.max_brightness_threshold', (value) => {
            const valPct = Math.round((value * 100) / 255);
            if (this.getSetting('max_brightness_threshold') !== valPct) {
                this.setSettings({ max_brightness_threshold: valPct }).catch(this.error);
            }
        });
        sonoffCluster.on('attr.transition_time', (value) => {
            const valSec = value / 10;
            if (this.getSetting('transition_time') !== valSec) {
                this.setSettings({ transition_time: valSec }).catch(this.error);
            }
        });
    }
  }

  async onDeleted() {
    this.log("MINI-ZBDIM Dimmer removed");
  }

}

module.exports = SonoffMiniZBDim;
