'use strict';

const SonoffBase = require('../sonoffbase');
const { Cluster, CLUSTER } = require('zigbee-clusters');
const SonoffCluster = require("../../lib/SonoffCluster");

Cluster.addCluster(SonoffCluster);

const Attributes = [
	'occupancy',
	'ultrasonicOccupiedToUnoccupiedDelay',
	'ultrasonicUnoccupiedToOccupiedDelay',
	'ultrasonicUnoccupiedToOccupiedThreshold'
];

class SonoffSNZB03P extends SonoffBase {

    async onNodeInit({zclNode}) {

		await super.onNodeInit({zclNode});

		this.configureAttributeReporting([
			{
				endpointId: 1,
				cluster: SonoffCluster,
				attributeName: 'illuminance'
			},
			{
				endpointId: 1,
				cluster: CLUSTER.OCCUPANCY_SENSING,
				attributeName: 'occupancy'
			}
		]).catch(this.error);

		zclNode.endpoints[1].clusters[CLUSTER.OCCUPANCY_SENSING.NAME]
			.on('attr.occupancy', (value) => {
				if (!value.occupied) //Check illuminance first when occupied
					this.setCapabilityValue('alarm_motion', value.occupied).catch(this.error);	
			});

		zclNode.endpoints[1].clusters[SonoffCluster.NAME]
			.on('attr.illuminance', (value) => {
				this.setCapabilityValue('sonoff_illuminance', value ? 'bright' : 'dim').catch(this.error);	
				this.setCapabilityValue('alarm_motion', true).catch(this.error);	
			});

		this.checkAttributes();
	}

	async onSettings({ oldSettings, newSettings, changedKeys }) {
		this.writeAttributes(CLUSTER.OCCUPANCY_SENSING, {
			ultrasonicOccupiedToUnoccupiedDelay: newSettings.occupied_to_unoccupied_delay,
			ultrasonicUnoccupiedToOccupiedThreshold: newSettings.occupied_threshold
		});
		this.checkAttributes();
	}

	async checkAttributes() {
		this.readAttribute(CLUSTER.OCCUPANCY_SENSING, Attributes, (data) => {
			this.setCapabilityValue('alarm_motion', data.occupancy.occupied).catch(this.error);
			this.setSettings({
				occupied_to_unoccupied_delay: data.ultrasonicOccupiedToUnoccupiedDelay,
				occupied_threshold: data.ultrasonicUnoccupiedToOccupiedThreshold.toString()
			}).catch(this.error);
		});
	}

}

module.exports = SonoffSNZB03P;
