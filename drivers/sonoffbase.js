'use strict';

const Homey = require('homey');
const { ZigBeeDevice } = require('homey-zigbeedriver');
const { debug, CLUSTER } = require('zigbee-clusters');

if (process.env.DEBUGPRO === "1") {
	debug(true);
}

class SonoffBase extends ZigBeeDevice {

	lastAskBattery = null;

	async onNodeInit({zclNode}) {
		this.log("NodeInit SonoffBase");

		if (process.env.DEBUGPRO === "1") {
			this.enableDebug();
			this.printNode();
		}

		if (this.isFirstInit()) {

			// await this.configureAttributeReporting([
			// 	{
			// 		endpointId: 1,
			// 		cluster: CLUSTER.POWER_CONFIGURATION,
			// 		attributeName: 'batteryPercentageRemaining',
			// 		minInterval: 1500, //??
			// 		maxInterval: 0,
			// 		minChange: 1
			// 	},

			this.checkBattery();
		}

		// // measure_battery 
		// zclNode.endpoints[1].clusters[CLUSTER.POWER_CONFIGURATION.NAME]
		// .on('attr.batteryPercentageRemaining', this.onBatteryPercentageRemainingAttributeReport.bind(this));
	}

	async checkBattery() {
		var now = Date.now();
		var dt = (now - this.lastAskBattery) / 1000;
		if (this.lastAskBattery > 60 * 60) { //Max every hour
			return;
		}
		this.lastAskBattery = now;
        try {
            this.log("Ask battery");
		    this.zclNode.endpoints[1].clusters[CLUSTER.POWER_CONFIGURATION.NAME]
				.readAttributes("batteryPercentageRemaining")
				.then((value) => {			
					this.log("BATTERY", value);
					this.setCapabilityValue('measure_battery', value.batteryPercentageRemaining / 2);
				})
				.catch(() => {			
					this.log("Error BATTERY");
				});
        } catch (error) {
            this.error('Kunde inte hämta batteristatus', error);
        }
    }

	// onBatteryPercentageRemainingAttributeReport(batteryPercentageRemaining) {
	// 	this.log("measure_battery | powerConfiguration - batteryPercentageRemaining (%): ", batteryPercentageRemaining/2);
	// 	this.setCapabilityValue('measure_battery', batteryPercentageRemaining/2).catch(this.error);
	// }

	onDeleted(){
		this.log("sonoff device removed")
	}

}

module.exports = SonoffBase;