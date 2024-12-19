'use strict';

const SonoffBase = require('../sonoffbase');
const { Cluster, CLUSTER } = require('zigbee-clusters');
const SonoffCluster = require("../../lib/SonoffCluster");

Cluster.addCluster(SonoffCluster);

class SonoffSNZB05P extends SonoffBase {

    async onNodeInit({zclNode}) {

		super.onNodeInit({zclNode}); //, {noAttribCheck:true});

		zclNode.endpoints[1].clusters.iasZone.onZoneStatusChangeNotification = data => {
			this.setCapabilityValue('alarm_water', data.zoneStatus.alarm1).catch(this.error);			
		};

	}

	async checkAttributes() {
		await this.readAttribute(CLUSTER.IAS_ZONE, ['zoneStatus'], (data) => {
			this.setCapabilityValue('alarm_water', data.zoneStatus.alarm1).catch(this.error);
		});
	}

}

module.exports = SonoffSNZB05P;
