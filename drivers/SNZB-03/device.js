'use strict';

const SonoffBase = require('../sonoffbase');
const { CLUSTER } = require('zigbee-clusters');

class SonoffSNZB04 extends SonoffBase {

    async onNodeInit({zclNode}) {

		super.onNodeInit({zclNode});

		//Fix upgrade from 1.0.14 
		if (this.hasCapability('alarm_contact') === true) {
			await this.removeCapability('alarm_contact');
			await this.addCapability('alarm_motion');
		}

		this.zoneStatusChangeNotification = this.zoneStatusChangeNotification.bind(this);
		
		//this.setCapabilityValue('alarm_motion', null).catch(this.error);	
		this.initAttribute(CLUSTER.IAS_ZONE, 'zoneStatus', this.zoneStatusChangeNotification);
		
		zclNode.endpoints[1].clusters.iasZone.onZoneStatusChangeNotification = this.zoneStatusChangeNotification;
	}

	zoneStatusChangeNotification(data) {
		this.setCapabilityValue('alarm_motion', data.zoneStatus.alarm1).catch(this.error);			
		//this.checkBattery();
	}

}

module.exports = SonoffSNZB04;
