'use strict';

const SonoffBase = require('../sonoffbase');
const { CLUSTER } = require('zigbee-clusters');

class SonoffSNZB04 extends SonoffBase {

    async onNodeInit({zclNode}) {

		super.onNodeInit({zclNode});

		// Listen for ZoneStatusChangeNotification
		zclNode.endpoints[1].clusters.iasZone.onZoneStatusChangeNotification = data => {
			this.setCapabilityValue('alarm_contact', data.zoneStatus.alarm1).catch(this.error);			
			this.checkBattery();
		};
	}

}

module.exports = SonoffSNZB04;
