'use strict';

const { ZigBeeDevice } = require("homey-zigbeedriver");
const { CLUSTER } = require('zigbee-clusters');

class SonoffBASICZBR3 extends ZigBeeDevice {

    async onNodeInit({ zclNode }) {
        this.log(`BASICZBR3: Device initialized`);
        this.printNode();

        if (this.hasCapability('onoff')) {
            this.registerCapability('onoff', CLUSTER.ON_OFF);
        }

        this.configureAttributeReporting([
            {
                endpointId: 1,
                cluster: CLUSTER.ON_OFF,
                attributeName: 'onOff',
                minInterval: 1,
                maxInterval: 3600,
                minChange: 1
            }
        ]).catch(err => this.error(`Failed to configure attribute reporting:`, err));
    }

    async onDeleted() {
        this.log(`BASICZBR3: Switch removed`);
    }

}

module.exports = SonoffBASICZBR3;
