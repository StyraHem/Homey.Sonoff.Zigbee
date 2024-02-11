'use strict';

const SonoffBase = require('../sonoffbase');
const { CLUSTER } = require('zigbee-clusters');

const Attributes = [
	'occupancy',
	'ultrasonicOccupiedToUnoccupiedDelay',
	'ultrasonicUnoccupiedToOccupiedDelay',
	'ultrasonicUnoccupiedToOccupiedThreshold'
];

class SonoffSNZB06P extends SonoffBase {

    async onNodeInit({zclNode}) {

		super.onNodeInit({zclNode});

		this.configureAttributeReporting([
			{
				endpointId: 1,
				cluster: CLUSTER.OCCUPANCY_SENSING,
				attributeName: 'occupancy'
			}
		]).catch(this.error);

		zclNode.endpoints[1].clusters[CLUSTER.OCCUPANCY_SENSING.NAME]
			.on('attr.occupancy', (value) => {
				this.setCapabilityValue('alarm_contact', value.occupied).catch(this.error);	
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
			this.setCapabilityValue('alarm_contact', data.occupancy.occupied).catch(this.error);
			this.setSettings({
				occupied_to_unoccupied_delay: data.ultrasonicOccupiedToUnoccupiedDelay,
				occupied_threshold: data.ultrasonicUnoccupiedToOccupiedThreshold.toString()
			});
		});
	}

}

module.exports = SonoffSNZB06P;
