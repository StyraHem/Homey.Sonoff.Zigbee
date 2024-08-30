'use strict';

const Homey = require('homey');
const SonoffBase = require('../sonoffbase');
const { CLUSTER } = require('zigbee-clusters');

class SonoffTRVZB extends SonoffBase {

	async onNodeInit({ zclNode }) {
		// Call the parent class's onNodeInit method
		super.onNodeInit({ zclNode });

		if (this.isFirstInit()) {

			await this.configureAttributeReporting([
				{
					endpointId: 1,
					cluster: CLUSTER.TIME,
					attributeName: 'time',
					minInterval: 0,
					maxInterval: 90,
					minChange: 1
				}
			]).then(() => {
                this.log('registered attr report listener');
            })
            .catch(err => {
                this.error('failed to register attr report listener', err);
            });
		}
		

		if (this.hasCapability('onoff')) {
            this.registerCapability('onoff', CLUSTER.ON_OFF);
        }
		
		zclNode.endpoints[1].clusters[CLUSTER.TIME.NAME]
            .on('attr.time', this.onTimeAttributeReport.bind(this));


		// Additional initialization code can be added here
		this.log('Sonoff TRVZB device initialized');
	}

	async onSettings({ oldSettings, newSettings, changedKeys }) {
		// Handle settings changes
		this.log('Settings changed:', { oldSettings, newSettings, changedKeys });

		// Implement any specific logic for handling settings changes here
	}

	async onTimeAttributeReport(report) {
		this.log("Time attribute report received:", report);
		// Implementera logik för att hantera time-attributrapportering här
	}

}

module.exports = SonoffTRVZB;
