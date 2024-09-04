'use strict';

const Homey = require('homey');
const SonoffBase = require('../sonoffbase');
//const { ZigBeeDevice } = require('homey-zigbeedriver');
const { Cluster, ZCLDataTypes, CLUSTER, BoundCluster, ThermostatCluster } = require('zigbee-clusters');
const SonoffCluster = require("../../lib/SonoffCluster");

Cluster.addCluster(SonoffCluster);

const Attributes = [
	'child_lock',
	'open_window',
	'frost_protection_temperature'
];

class TimeBoundCluster extends BoundCluster {
    constructor(node) {
        super();
    }
    time() {
        this.log("Time attribute report received:", report);
    }
}

class TRVThermostatCluster extends ThermostatCluster {
    static get ATTRIBUTES() {
        return {
            ...super.ATTRIBUTES,
            customAttribute1: {
                id: 41, 
                type: ZCLDataTypes.uint16,
            }
        };
    }
}

Cluster.addCluster(TRVThermostatCluster);

class SonoffTRVZB extends SonoffBase {

	async onNodeInit({ zclNode }) {

		super.onNodeInit({ zclNode }, {noAttribCheck:true});

		this.Clus
		if (this.isFirstInit()) {

			await this.configureAttributeReporting([
				{
					endpointId: 1,
					cluster: CLUSTER.THERMOSTAT,
					attributeName: 'localTemperature',
					minInterval: 0,
					maxInterval: 3600,
					minChange: 10
				},
				{
					endpointId: 1,
					cluster: CLUSTER.THERMOSTAT,
					attributeName: 'occupiedHeatingSetpoint',
					minInterval: 0,
					maxInterval: 3600,
					minChange: 10
				},
				{
					endpointId: 1,
					cluster: CLUSTER.THERMOSTAT,
					attributeName: 'localTemperatureCalibration',
					minInterval: 0,
					maxInterval: 3600,
					minChange: 10
				},
				...Attributes.map( (value) => {
					return {
						endpointId: 1,
						cluster: SonoffCluster,
						attributeName: value,
						minInterval: 0,
						maxInterval: 3600
					}
				})
			]).then(() => {
                this.log('registered attr report listener');
            })
            .catch(err => {
                this.error('failed to register attr report listener', err);
            });
		}

		//if (this.hasCapability('onoff')) {
        //    this.registerCapability('onoff', CLUSTER.ON_OFF);
        //}

		zclNode.endpoints[1].bind(CLUSTER.TIME.NAME, new TimeBoundCluster(this));

		this.registerCapability("measure_temperature", CLUSTER.THERMOSTAT, {
			report: 'localTemperature',
			reportParser: value => value / 100,
			get: 'localTemperature',
			getParser: value => value / 100
		});

		this.registerCapability("target_temperature", CLUSTER.THERMOSTAT, {
			report: 'occupiedHeatingSetpoint',
			reportParser: value => value / 100,
			get: 'occupiedHeatingSetpoint',
			getParser: value => value / 100
		});
		this.registerCapabilityListener("target_temperature", async (value) => {
			this.writeAttributes(CLUSTER.THERMOSTAT, {
				occupiedHeatingSetpoint: value * 100
			});
		});
		
		zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME]
			.on('attr.localTemperatureCalibration', (value) => {
				this.setSettings(o);
		});

		Attributes.forEach( (attr) => {
			zclNode.endpoints[1].clusters[SonoffCluster.NAME]
            .on('attr.' + attr, (value) => {
				var o = {}
				o[attr]=value;
				this.setSettings(o);
			});
		});

		this.checkAttributes();

		// Additional initialization code can be added here
		this.log('Sonoff TRVZB device initialized');
	}

	async setSettings(settings) {
		Object.entries(settings).forEach(([key, value]) => {
			if (key=="localTemperatureCalibration") {
				settings[key] = value / 100;
			} else if (key.includes("temperature")) {  //Accept t/Temperature
				settings[key] = value / 100;
			}
		});	
		await super.setSettings(settings);
	}
	
	async onSettings({ oldSettings, newSettings, changedKeys }) {
		const changedAttributes = Attributes.reduce((acc, key) => {
			if (newSettings.hasOwnProperty(key)) {
				acc[key] = newSettings[key];
				if (key.includes("temperature"))  
					acc[key] = acc[key] * 100;
			}
			return acc;
		}, {});

		await this.writeAttributes(SonoffCluster, changedAttributes);

		await this.writeAttributes(CLUSTER.THERMOSTAT, {localTemperatureCalibration: newSettings.localTemperatureCalibration * 10});
		//this.checkAttributes();
	}

	async checkAttributes() {
		this.readAttribute(SonoffCluster, Attributes, (data) => {
			this.setSettings(data);
		});
		this.readAttribute(CLUSTER.THERMOSTAT, ['localTemperatureCalibration'], (data) => {
			this.setSettings(data);
		});
	}

}

module.exports = SonoffTRVZB;
