'use strict';

const Homey = require('homey');
const SonoffBase = require('../sonoffbase');
const { Cluster, CLUSTER } = require('zigbee-clusters');
const SonoffIlluminationCluster = require("../../lib/SonoffIlluminationCluster");

Cluster.addCluster(SonoffIlluminationCluster);

const Attributes = [
	'occupancy',
	'ultrasonicOccupiedToUnoccupiedDelay',
	'ultrasonicUnoccupiedToOccupiedDelay',
	'ultrasonicUnoccupiedToOccupiedThreshold'
];

class SonoffSNZB06P extends SonoffBase {

    async onNodeInit({zclNode}) {

		super.onNodeInit({zclNode});

		//Fix upgrade from 1.0.14 
		if (this.hasCapability('alarm_contact') === true) {
			await this.removeCapability('alarm_contact');
			await this.addCapability('alarm_motion');
		}

		this.configureAttributeReporting([
			{
				endpointId: 1,
				cluster: SonoffIlluminationCluster.NAME,
				attributeName: 'illuminance'
			},
			{
				endpointId: 1,
				cluster: CLUSTER.OCCUPANCY_SENSING,
				attributeName: 'occupancy'
			}
		]).catch(this.error);

		let brightCondition = 
			this.homey.flow.getConditionCard('is_bright');
		brightCondition
			.registerRunListener(async ( args, state ) => {
				const illuminance = await this.getCapabilityValue('sonoff_illuminance');
				return illuminance == 'bright';
			});

		zclNode.endpoints[1].clusters[CLUSTER.OCCUPANCY_SENSING.NAME]
			.on('attr.occupancy', (value) => {
				if (!value.occupied) //Check illuminance first when occupied
					this.setCapabilityValue('alarm_motion', value.occupied).catch(this.error);	
			});

		zclNode.endpoints[1].clusters[SonoffIlluminationCluster.NAME]
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
		// this.readAttribute(SonoffIlluminationCluster, ['illuminance'], (data) => {
		// 	//this.setCapabilityValue('light_presence', data.illuminance).catch(this.error);
		// });
		this.readAttribute(CLUSTER.OCCUPANCY_SENSING, Attributes, (data) => {
			this.setCapabilityValue('alarm_motion', data.occupancy.occupied).catch(this.error);
			this.setSettings({
				occupied_to_unoccupied_delay: data.ultrasonicOccupiedToUnoccupiedDelay,
				occupied_threshold: data.ultrasonicUnoccupiedToOccupiedThreshold.toString()
			});
		});
	}

}

module.exports = SonoffSNZB06P;
