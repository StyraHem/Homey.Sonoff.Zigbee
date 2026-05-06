'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');

class SonoffZBM5_2C_Gang2 extends ZigBeeDevice {

    async onNodeInit({ zclNode }) {

        this.log('ZBM5-2C-120 Gang 2 (sub-device) init — endpoint 2');

        if (this.hasCapability('onoff')) {
            this.registerCapability('onoff', CLUSTER.ON_OFF, { endpoint: 2 });
        }

        this.configureAttributeReporting([
            {
                endpointId: 2,
                cluster: CLUSTER.ON_OFF,
                attributeName: 'onOff',
                minInterval: 0,
                maxInterval: 3600
            }
        ]).catch(this.error);
    }

    async onDeleted() {
        this.log("ZBM5-2C-120 Gang 2 removed");
    }

}

module.exports = SonoffZBM5_2C_Gang2;
