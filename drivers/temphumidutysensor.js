'use strict';

const Homey = require('homey');
const SonoffBase = require('./sonoffbase');
const { debug, CLUSTER } = require('zigbee-clusters');

class TempHumiditySensor extends SonoffBase {

	async onNodeInit({zclNode}) {

		super.onNodeInit(...arguments);
		
		if (this.isFirstInit()) {

			await this.configureAttributeReporting([
				{
					endpointId: 1,
					cluster: CLUSTER.TEMPERATURE_MEASUREMENT,
					attributeName: 'measuredValue',
					minInterval: 0,
					maxInterval: 90,
					minChange: 1
				},
				{
					endpointId: 1,
					cluster: CLUSTER.RELATIVE_HUMIDITY_MEASUREMENT,
					attributeName: 'measuredValue',
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
		
		// measure_temperature
		zclNode.endpoints[1].clusters[CLUSTER.TEMPERATURE_MEASUREMENT.NAME]
		.on('attr.measuredValue', this.onTemperatureMeasuredAttributeReport.bind(this));
  
		// measure_humidity
		zclNode.endpoints[1].clusters[CLUSTER.RELATIVE_HUMIDITY_MEASUREMENT.NAME]
		.on('attr.measuredValue', this.onRelativeHumidityMeasuredAttributeReport.bind(this));

		
		
	}

	onTemperatureMeasuredAttributeReport(measuredValue) {
		const temperatureOffset = this.getSetting('temperature_offset') || 0;
		const parsedValue = this.getSetting('temperature_decimals') === '2' ? Math.round((measuredValue / 100) * 100) / 100 : Math.round((measuredValue / 100) * 10) / 10;
		this.setCapabilityValue('measure_temperature', parsedValue + temperatureOffset).catch(this.error);
		this.checkBattery();
	}

	onRelativeHumidityMeasuredAttributeReport(measuredValue) {
		const humidityOffset = this.getSetting('humidity_offset') || 0;
		const parsedValue = this.getSetting('humidity_decimals') === '2' ? Math.round((measuredValue / 100) * 100) / 100 : Math.round((measuredValue / 100) * 10) / 10;
		this.setCapabilityValue('measure_humidity', parsedValue + humidityOffset).catch(this.error);
		this.checkBattery();
	}

}

module.exports = TempHumiditySensor;