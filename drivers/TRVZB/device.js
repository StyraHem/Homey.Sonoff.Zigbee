'use strict';

const Homey = require('homey');
const SonoffBase = require('../sonoffbase');
//const { ZigBeeDevice } = require('homey-zigbeedriver');
const { Cluster, ZCLDataTypes, ZCLDataType, CLUSTER, BoundCluster, ThermostatCluster } = require('zigbee-clusters');
const { ZCLStandardHeader } = require('zigbee-clusters/lib/zclFrames');
const SonoffCluster = require("../../lib/SonoffCluster");

Cluster.addCluster(SonoffCluster);


const Settings_Attributes = [
	'child_lock',
	'open_window',
	'frost_protection_temperature'
];

/*
const TB_ATTRIBUTES = {

	physicalMinLevel: {
	  id: 0,
	  type: ZCLDataTypes.uint8,
	},
}
	*/

function uintToBuf(buf, v, i) {
	return buf.writeUInt32LE(v, i, this.length) - i;
}

function uintFromBuf(buf, i) {
	if (buf.length - i < this.length) return 0;
	return buf.readUInt32LE(i, this.length);
}

const DATATYPE_UTC = new ZCLDataType(0xE2, 'uint32', 4, uintToBuf, uintFromBuf)
const DATATYPE_UTC2 = new ZCLDataType(0x23, 'uint32', 4, uintToBuf, uintFromBuf)

class SonoffTimeBoundCluster extends BoundCluster {
	constructor(endpoint) {
		super();
		this.ep = endpoint;
	}
	static get ID() {
		return 10; // 0xA
	}
	static get NAME() {
		return 'time';
	}
	static get ATTRIBUTES() {
		return {
			time: {
				id: 0,
				type: DATATYPE_UTC
			},
			local_time: {
				id: 7,
				type: DATATYPE_UTC2
			}
		};
	}
	get time() {
		return this.time_since_2000(new Date());
	}
	get local_time() {
		return this.time_since_2000(new Date());
	}
	time_since_2000(date) {
		const year2000 = new Date('2000-01-01T00:00:00Z');
		const timeSince2000 = date.getTime() - year2000.getTime();
		return Math.floor(timeSince2000 / 1000) >>> 0;
	}
	async handleFrame(frame, meta, rawFrame) {
		this.frame = frame;
		return await super.handleFrame(frame, meta, rawFrame);
		this.frame = null;
	}
	async readAttributes({ attributes }) {
		var result = await super.readAttributes({ attributes });
		const resp = new ZCLStandardHeader();
		resp.frameControl.directionToClient = true;
		resp.frameControl.disableDefaultResponse = true;
		resp.trxSequenceNumber = this.frame.trxSequenceNumber;
		resp.cmdId = 1;
		resp.data = result.attributes;	
		await this.ep._node.sendFrame(1, CLUSTER.TIME.ID, resp.toBuffer());
		return result;
	}
}

Cluster.addCluster(SonoffTimeBoundCluster);

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

		super.onNodeInit({ zclNode }, {noAttribCheck:false});

		if (!this.hasCapability('onoff')) { //Add onoff capability if not already added
			await this.addCapability('onoff');
        }
		
		this.registerCapability('onoff', CLUSTER.ON_OFF);

		if (this.isFirstInit()) {
			
			/*
			await this.configureAttributeReporting([
				{
					endpointId: 1,
					cluster: CLUSTER.THERMOSTAT,
					attributeName: 'localTemperature',	//localTemp/localTemperature
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
				...Settings_Attributes.map( (value) => {
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
			*/
			
		}

		//zclNode.endpoints[1].bind('time', new SonoffTimeBoundCluster(this));
		zclNode.endpoints[1].bind('time', zclNode.endpoints[1].clusters.time);
		/*
		const oldHandleFrame = zclNode.endpoints[1].handleFrame.bind(zclNode.endpoints[1]);
		zclNode.endpoints[1].handleFrame = async (clusterId, frame, meta) => {
			const response = await oldHandleFrame(clusterId, frame, meta);
		};
		*/

		//??await zclNode.endpoints[1].bind(CLUSTER.THERMOSTAT.NAME, new TRVThermostatCluster(this));

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
			getParser: value => value / 100,
			//set: 'occupiedHeatingSetpoint',  //Not working, use listener belove
			//setParser: value => value * 100
		});

		//When change in Homey
		this.registerCapabilityListener("target_temperature", async (value) => {
			this.writeAttributes(CLUSTER.THERMOSTAT, {
				occupiedHeatingSetpoint: value * 100
			});
		});

		zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME]
			.on('attr.localTemperatureCalibration', (value) => {
				this.setSettings(o).catch(this.error);
		});

		Settings_Attributes.forEach( (attr) => {
			zclNode.endpoints[1].clusters[SonoffCluster.NAME]
            .on('attr.' + attr, (value) => {
				var o = {}
				o[attr]=value;
				this.setSettings(o).catch(this.error);
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
		const changedAttributes = Settings_Attributes.reduce((acc, key) => {
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
		this.readAttribute(SonoffCluster, Settings_Attributes, (data) => {
			this.setSettings(data).catch(this.error);
		});
		this.readAttribute(CLUSTER.THERMOSTAT, ['localTemperatureCalibration'], (data) => {
			this.setSettings(data).catch(this.error);
		});
	}
		

}

module.exports = SonoffTRVZB;

/*
Bindings
1,
1026,
513,
6,
10

Clusters
0,
1,
1026,
513,
6,
10,
64529
*/