'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');

class SonoffZBM5_3C_Gang3 extends ZigBeeDevice {

    async onNodeInit({ zclNode }) {

        this.log('ZBM5-3C-120 Gang 3 (sub-device) init — endpoint 3');

        if (this.hasCapability('onoff')) {
            this.registerCapability('onoff', CLUSTER.ON_OFF, { endpoint: 3 });
        }

        this.configureAttributeReporting([
            {
                endpointId: 3,
                cluster: CLUSTER.ON_OFF,
                attributeName: 'onOff',
                minInterval: 0,
                maxInterval: 3600
            }
        ]).catch(this.error);
    }

    async onDeleted() {
        this.log("ZBM5-3C-120 Gang 3 removed");
    }

}

module.exports = SonoffZBM5_3C_Gang3;
