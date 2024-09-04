'use strict';

const SonoffBase = require('../sonoffbase');
const { CLUSTER } = require('zigbee-clusters');
const SonoffCluster = require("../../lib/SonoffCluster");

Cluster.addCluster(SonoffCluster);

class SonoffSNZB04P extends SonoffBase {

    async onNodeInit({zclNode}) {

		super.onNodeInit({zclNode});

		
		if (this.isFirstInit()) {

			await this.configureAttributeReporting([
				{
					endpointId: 1,
					cluster: SonoffCluster,
					attributeName: 'tamper'
				},
			]).then(() => {
                this.log('registered attr report listener');
            })
            .catch(err => {
                this.error('failed to register attr report listener', err);
            });
		}

		this.registerCapability("alarm_tamper", SonoffCluster, {
			report: 'tamper',
			reportParser: value => value,
			get: 'tamper',
			getParser: value => value
		});

		zclNode.endpoints[1].clusters.iasZone.onZoneStatusChangeNotification = data => {
			this.setCapabilityValue('alarm_contact', data.zoneStatus.alarm1).catch(this.error);			
		};
	}

}

module.exports = SonoffSNZB04P;
