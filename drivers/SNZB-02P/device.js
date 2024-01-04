'use strict';

const Homey = require('homey');
const { ZigBeeDevice } = require('homey-zigbeedriver');
const { debug, CLUSTER } = require('zigbee-clusters');

debug(true);

class temphumidsensor extends ZigBeeDevice {

	async onNodeInit({zclNode}) {

		this.enableDebug();
		this.printNode();
		
		//if (this.isFirstInit()){
			this.log("YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY");
			await this.configureAttributeReporting([
				{
					endpointId: 1,
					cluster: CLUSTER.POWER_CONFIGURATION,
					attributeName: 'batteryPercentageRemaining',
					minInterval: 1,
					maxInterval: 0,
					minChange: 1
				}
			]).then(() => {
                // Registering attr reporting succeeded
                this.log('registered attr report listener');
            })
            .catch(err => {
                // Registering attr reporting failed
                this.error('failed to register attr report listener', err);
            });
		//}
		
		// measure_temperature
		zclNode.endpoints[1].clusters[CLUSTER.TEMPERATURE_MEASUREMENT.NAME]
		.on('attr.measuredValue', this.onTemperatureMeasuredAttributeReport.bind(this));
  
		// measure_humidity
		zclNode.endpoints[1].clusters[CLUSTER.RELATIVE_HUMIDITY_MEASUREMENT.NAME]
		.on('attr.measuredValue', this.onRelativeHumidityMeasuredAttributeReport.bind(this));

		// measure_battery 
		zclNode.endpoints[1].clusters[CLUSTER.POWER_CONFIGURATION.NAME]
		.on('attr.batteryPercentageRemaining', this.onBatteryPercentageRemainingAttributeReport.bind(this));
		
	}

	onTemperatureMeasuredAttributeReport(measuredValue) {
		const temperatureOffset = this.getSetting('temperature_offset') || 0;
		const parsedValue = this.getSetting('temperature_decimals') === '2' ? Math.round((measuredValue / 100) * 100) / 100 : Math.round((measuredValue / 100) * 10) / 10;
		this.log('measure_temperature | temperatureMeasurement - measuredValue (temperature):', parsedValue, '+ temperature offset', temperatureOffset);
		this.setCapabilityValue('measure_temperature', parsedValue + temperatureOffset).catch(this.error);
	}

	onRelativeHumidityMeasuredAttributeReport(measuredValue) {
		const humidityOffset = this.getSetting('humidity_offset') || 0;
		const parsedValue = this.getSetting('humidity_decimals') === '2' ? Math.round((measuredValue / 100) * 100) / 100 : Math.round((measuredValue / 100) * 10) / 10;
		this.log('measure_humidity | relativeHumidity - measuredValue (humidity):', parsedValue, '+ humidity offset', humidityOffset);
		this.setCapabilityValue('measure_humidity', parsedValue + humidityOffset).catch(this.error);
	}

	onBatteryPercentageRemainingAttributeReport(batteryPercentageRemaining) {
		this.log("measure_battery | powerConfiguration - batteryPercentageRemaining (%): ", batteryPercentageRemaining/2);
		//const batteryThreshold = this.getSetting('batteryThreshold') || 20;
		this.setCapabilityValue('measure_battery', batteryPercentageRemaining/2).catch(this.error);
		//this.setCapabilityValue('alarm_battery', (batteryPercentageRemaining/2 < batteryThreshold) ? true : false).catch(this.error);
	}

	onDeleted(){
		this.log("temphumidsensor removed")
	}

}

module.exports = temphumidsensor;
