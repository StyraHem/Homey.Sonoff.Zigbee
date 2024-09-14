'use strict';

const SonoffBase = require('../sonoffbase');
const { Cluster, CLUSTER } = require('zigbee-clusters');
const SonoffCluster = require("../../lib/SonoffCluster");

Cluster.addCluster(SonoffCluster);

class SonoffSNZB04P extends SonoffBase {

    async onNodeInit({zclNode}) {

		super.onNodeInit({zclNode}); //, {noAttribCheck:true});

		/*
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
		}*/

		this.registerCapability("alarm_tamper", SonoffCluster, {
			report: 'tamper',
			reportParser: value => Boolean(value),
			get: 'tamper',
			getParser: value => Boolean(value),
			getOpts: { getOnStart: true, getOnOnline: true }
		});

		zclNode.endpoints[1].clusters.iasZone.onZoneStatusChangeNotification = data => {
			this.setCapabilityValue('alarm_contact', data.zoneStatus.alarm1).catch(this.error);			
		};

	}

	async checkAttributes() {
		await this.readAttribute(CLUSTER.IAS_ZONE, ['zoneStatus'], (data) => {
			this.setCapabilityValue('alarm_contact', data.zoneStatus.alarm1).catch(this.error);
		});
		await this.readAttribute(SonoffCluster, ['tamper'], (data) => {
			this.setCapabilityValue('alarm_tamper', data).catch(this.error);
		});
	}

}

module.exports = SonoffSNZB04P;
