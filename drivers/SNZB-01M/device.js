'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { Cluster, ZCLDataTypes } = require('zigbee-clusters');

class SonoffPrivateCluster extends Cluster {
  static get NAME() { return 'sonoffPrivate'; }
  static get ID() { return 0xFC12; }
  static get ATTRIBUTES() {
    return {
      action: { id: 0x0000, type: ZCLDataTypes.uint8 },
    };
  }
  static get COMMANDS() { return {}; }
}
Cluster.addCluster(SonoffPrivateCluster);

const ACTION_MAP = {
  1: 'single',
  2: 'double',
  3: 'long',
  4: 'triple',
};

class SNZB01MDevice extends ZigBeeDevice {

  async onNodeInit({ zclNode }) {

    // Initialization

    // ── Batería ───────────────────────────────────────────────────────────────
    try {
      const powerCluster = zclNode.endpoints[1].clusters.powerConfiguration;
      powerCluster.on('attr.batteryPercentageRemaining', value => {
        this.setCapabilityValue('measure_battery', Math.round(value / 2)).catch(this.error);
      });
    } catch (err) {
      this.log('Error configurando batería:', err.message);
    }

    // ── Botones ───────────────────────────────────────────────────────────────
    for (let ep = 1; ep <= 4; ep++) {
      const epNode = zclNode.endpoints[ep];
      if (!epNode) continue;

      const cluster = epNode.clusters[SonoffPrivateCluster.NAME];
      if (!cluster) continue;

      cluster.on('attr.action', value => {
        const action = ACTION_MAP[value];

        if (!ACTION_MAP[value]) return;

        const triggerId = `SNZB-01M:button${ep}_${action}`;
        this.homey.flow
          .getDeviceTriggerCard(triggerId)
          .trigger(this, {}, {})
          .catch(err => this.error(`Trigger ${triggerId} ERROR:`, err.message));
      });
    }

  }

}

module.exports = SNZB01MDevice;
