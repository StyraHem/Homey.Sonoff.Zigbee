'use strict';

const SonoffOnOffCluster = require("../../lib/SonoffOnOffCluster");
const { Cluster, CLUSTER } = require('zigbee-clusters');
Cluster.addCluster(SonoffOnOffCluster);

const SonoffCluster = require("../../lib/SonoffCluster");
Cluster.addCluster(SonoffCluster);

const SonoffBase = require('../sonoffbase');

const SonoffClusterAttributes = [
    'power_on_delay_state',
    'power_on_delay_time',
    'switch_mode',
    'detach_mode'
];

class SonoffZBM5_1C extends SonoffBase {

    async onNodeInit({ zclNode }) {

        super.onNodeInit({ zclNode });

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

        this.checkAttributes();
    }

    async onSettings({ oldSettings, newSettings, changedKeys }) {
        if (changedKeys.includes("power_on_behavior")) {
            try {
                await this.zclNode.endpoints[1].clusters.onOff.writeAttributes({ powerOnBehavior: newSettings.power_on_behavior });
            } catch (error) {
                this.log("Error updating the power on behavior");
            }
        }

        this.writeAttributes(SonoffCluster, newSettings, changedKeys).catch(this.error);
    }

    async checkAttributes() {
        this.readAttribute(CLUSTER.ON_OFF, ['powerOnBehavior'], (data) => {
            this.setSettings({ power_on_behavior: data.powerOnBehavior }).catch(this.error);
        });

        this.readAttribute(SonoffCluster, SonoffClusterAttributes, (data) => {
            this.setSettings(data).catch(this.error);
        });
    }

    async onDeleted() {
        this.log("ZBM5-1C-120 removed");
    }

}

module.exports = SonoffZBM5_1C;
