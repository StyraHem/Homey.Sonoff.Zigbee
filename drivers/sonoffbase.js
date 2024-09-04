'use strict';

const Homey = require('homey');
const { ZigBeeDevice } = require('homey-zigbeedriver');
const { debug, CLUSTER } = require('zigbee-clusters');

if (process.env.DEBUG === "1") {
	debug(true);
}

class SonoffBase extends ZigBeeDevice {

	lastAskBattery = null;

	async onNodeInit({zclNode}, options) {
		this.log("NodeInit SonoffBase");
		options = options || {};

		if (process.env.DEBUG === "1") {
			this.enableDebug();
		}
		this.printNode();

		if (options.noAttribCheck!=true) {
			if ("powerConfiguration" in zclNode.endpoints[1].clusters) {
				var nodeHandleFrame = this.node.handleFrame;
				this.node.handleFrame = (...args) => {
					nodeHandleFrame.apply(this, args);
					this.checkBattery();
					this.checkAttributes();
				};
			}
		}

	}

	async checkAttributes() {
	}

	async checkBattery() {
		this.log("Check battery");
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

	async initAttribute(cluster, attr, handler) {
		if (!this.isFirstInit())
			return;
		this.readAttribute(cluster, attr, handler)
    }

	async readAttribute(cluster, attr, handler) {
		if ("NAME" in cluster)
			cluster = cluster.NAME;
		if (!attr instanceof Array) {
			attr = [ attr ];
		}
		try {
			this.log("Ask attribute", attr);
			this.zclNode.endpoints[1].clusters[cluster]
				.readAttributes(...attr)
				.then((value) => {			
					this.log("Got attr", attr, value);
					handler(value);
				})
				.catch((e) => {			
					this.error("Error read attr", attr);
				});
		} catch (error) {
			this.error('Error (2) read', attr, error);
		}
	}

	async writeAttribute(cluster, attr, value) {
		var data = {};
		data[attr] = value;
		this.writeAttributes(cluster, data);
	}

	async writeAttributes(cluster, attribs) {
		if ("NAME" in cluster)
		cluster = cluster.NAME;
		try {
			this.log("Write attribute", attribs);
			this.zclNode.endpoints[1].clusters[cluster]
				.writeAttributes(attribs) 
				.then((value) => {			
					this.log("Write attr", attribs);
					handler(value);
				})
				.catch(() => {			
					this.error("Error write attr", attribs);
				});
		} catch (error) {
			this.error('Error (2) read', attribs, error);
		}
	}

	onDeleted(){
		this.log("sonoff device removed")
	}

}

module.exports = SonoffBase;