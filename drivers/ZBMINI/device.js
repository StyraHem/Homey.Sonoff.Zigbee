'use strict';

const { ZigBeeDevice } = require("homey-zigbeedriver");

const SonoffOnOffCluster = require("../../lib/SonoffOnOffCluster");

const { Cluster, CLUSTER } = require('zigbee-clusters');

Cluster.addCluster(SonoffOnOffCluster);

class SonoffZBMINI extends ZigBeeDevice {

 /**
   * onInit is called when the device is initialized.
   */
    async onNodeInit({ zclNode }) {
        this.log('Device initialized');
        this.printNode();

        if (this.hasCapability('onoff')) {
            this.registerCapability('onoff', CLUSTER.ON_OFF);
        }
    }

    

  /**
   * onDeleted is called when the user deleted the device.
   */
    async onDeleted() {
        this.log("smartswitch removed");
    }

}

module.exports = SonoffZBMINI;
