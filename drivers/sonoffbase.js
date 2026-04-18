'use strict';

const Homey = require('homey');
const { ZigBeeDevice } = require('homey-zigbeedriver');
const { debug, CLUSTER } = require('zigbee-clusters');

if (process.env.DEBUG === "1") {
	debug(true);
}

class SonoffBase extends ZigBeeDevice {

	lastPollAttributes = null;

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

					var now = Date.now();
					var dt = (now - this.lastPollAttributes) / 1000;
					if (dt > 60 * 60) { //Max every hour
						this.lastPollAttributes = now;	
						this.checkBattery();
						this.checkAttributes();
					}
				};
			}
		}

	}

	async checkAttributes() {
	}

	async checkBattery() {
		this.log("Check battery");
		
        try {
            this.log("Ask battery");
		    this.zclNode.endpoints[1].clusters[CLUSTER.POWER_CONFIGURATION.NAME]
				.readAttributes("batteryPercentageRemaining")
				.then((value) => {			
					this.log("BATTERY", value);
					this.setCapabilityValue('measure_battery', value.batteryPercentageRemaining / 2).catch(this.error);
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

	async writeAttributes(cluster, attribs, filter=null) {
		let items = {};
		try {
			if ("NAME" in cluster)
				cluster = cluster.NAME;
			const clust = this.zclNode.endpoints[1].clusters[cluster];
			items = {};
			for (const key in attribs) {
				if (filter && !filter.includes(key))
					continue;
				if (!(key in clust.constructor.attributes))
					continue;
				items[key] = attribs[key];
			}

			if (!Object.keys(items).length) {
				this.log("Write attribute", {});
				return;
			}

			this.log("Write attributes sequentially", items);
			const results = [];
			for (const [key, value] of Object.entries(items)) {
				try {
					this.log(`Writing single attribute: { ${key}: ${value} }`);
					const res = await clust.writeAttributes({ [key]: value });
					results.push(res);
				} catch (err) {
					this.error(`Error writing single attribute ${key}:`, err);
					throw err; // Fail fast
				}
			}
			return Object.keys(items).length === 1 ? results[0] : results;
		} catch (error) {
			this.error("Error write attr", items, error);
			throw error;
		}
	}

	/**
	 * Set inching (auto-off/on) configuration for a specific channel.
	 * @param {boolean} enabled - Enable or disable inching
	 * @param {number} time - Time in seconds
	 * @param {string} mode - 'on' (turn ON then OFF) or 'off' (turn OFF then ON)
	 * @param {number} channelIndex - 0 for channel 1, 1 for channel 2 (default 0)
	 */
	async setInching(enabled = false, time = 1, mode = 'on', channelIndex = 0) {
		try {
			const msTime = Math.round(time * 1000);
			const rawTimeUnits = Math.round(msTime / 500);
			const tmpTime = Math.min(Math.max(rawTimeUnits, 1), 0xffff);

			const payloadValue = [];
			payloadValue[0] = 0x01; // Cmd
			payloadValue[1] = 0x17; // SubCmd - INCHING
			payloadValue[2] = 0x07; // Length
			payloadValue[3] = 0x80; // SeqNum
			payloadValue[4] = (enabled ? 0x80 : 0x00) | (mode === 'on' ? 0x01 : 0x00);
			payloadValue[5] = channelIndex;
			payloadValue[6] = tmpTime & 0xff;
			payloadValue[7] = (tmpTime >> 8) & 0xff;
			payloadValue[8] = 0x00;
			payloadValue[9] = 0x00;

			// CheckCode (XOR checksum)
			payloadValue[10] = 0x00;
			for (let i = 0; i < payloadValue[2] + 3; i++) {
				payloadValue[10] ^= payloadValue[i];
			}

			this.log(`Sending inching command (CH ${channelIndex + 1}):`, { enabled, mode, time });

			// Use Root Device context for ZCL I/O
			const cluster = this.zclNode.endpoints[1].clusters['SonoffCluster'];
			await cluster.protocolData(
				{ data: Buffer.from(payloadValue) },
				{ disableDefaultResponse: true, waitForResponse: false }
			);
		} catch (error) {
			this.error('Failed to set inching:', error);
			throw error;
		}
	}

	onDeleted(){
		this.log("sonoff device removed")
	}

}

module.exports = SonoffBase;