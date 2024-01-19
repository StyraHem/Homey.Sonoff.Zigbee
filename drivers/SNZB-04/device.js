'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { debug, CLUSTER } = require('zigbee-clusters');

class SonoffSNZB04 extends ZigBeeDevice {

    async onNodeInit({zclNode}) {

        this.enableDebug();
		this.printNode();
        
        zclNode.endpoints[1].clusters[CLUSTER.IAS_ZONE.NAME]
		.on('attr.zoneStatus', this.onStatus.bind(this));
	}

    onStatus(){

    }

	onDeleted(){
		this.log("removed")
	}

}

module.exports = SonoffSNZB04;
