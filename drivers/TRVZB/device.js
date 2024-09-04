'use strict';

const Homey = require('homey');
const SonoffBase = require('../sonoffbase');
const { Cluster, ZCLDataTypes, CLUSTER, BoundCluster, ThermostatCluster } = require('zigbee-clusters');
const SonoffCluster = require("../../lib/SonoffCluster");

Cluster.addCluster(SonoffCluster);

const Attributes = [
	'occupancy',
	'ultrasonicOccupiedToUnoccupiedDelay',
	'ultrasonicUnoccupiedToOccupiedDelay',
	'ultrasonicUnoccupiedToOccupiedThreshold'
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
		// Call the parent class's onNodeInit method
		super.onNodeInit({ zclNode });

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
					cluster: SonoffCluster,
					attributeName: 'illuminance'
				},
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

		// Additional initialization code can be added here
		this.log('Sonoff TRVZB device initialized');
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
			});
		});
	}

}

module.exports = SonoffTRVZB;
