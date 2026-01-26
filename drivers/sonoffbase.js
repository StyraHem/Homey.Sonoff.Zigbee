'use strict';

const Homey = require('homey');
const { ZigBeeDevice } = require('homey-zigbeedriver');
const { debug, CLUSTER } = require('zigbee-clusters');

class SonoffBase extends ZigBeeDevice {

    _lastPollAttributes = null;
    _originalHandleFrame = null;
    _handleFrameWrapper = null;

    async onNodeInit({zclNode}, options) {
        this.log(`NodeInit SonoffBase`);
        options = options || {};
        this._lastPollAttributes = Date.now();

        this.printNode();

        if (options.noAttribCheck != true) {
            if ("powerConfiguration" in zclNode.endpoints[1].clusters) {
                this._originalHandleFrame = this.node.handleFrame;
                this._handleFrameWrapper = this._onHandleFrame.bind(this);
                this.node.handleFrame = this._handleFrameWrapper;
            }
        }
    }

    _onHandleFrame(...args) {
        if (this._originalHandleFrame) {
            this._originalHandleFrame.apply(this, args);
        }
        
        const now = Date.now();
        const dt = (now - this._lastPollAttributes) / 1000;
        
        if (dt > 60 * 60) {
            this._lastPollAttributes = now;
            this.checkBattery();
            this.checkAttributes();
        }
    }

    async checkAttributes() {
    }

    async checkBattery() {
        this.log(`Check battery`);
        
        try {
            this.log(`Ask battery`);
            const value = await this.zclNode.endpoints[1].clusters[CLUSTER.POWER_CONFIGURATION.NAME]
                .readAttributes("batteryPercentageRemaining");
            
            this.log(`BATTERY`, value);
            await this.setCapabilityValue('measure_battery', value.batteryPercentageRemaining / 2);
        } catch (error) {
            this.error(`Could not get battery status:`, error);
        }
    }

    async initAttribute(cluster, attr, handler) {
        if (!this.isFirstInit())
            return;
        this.readAttribute(cluster, attr, handler);
    }

    async readAttribute(cluster, attr, handler) {
        if ("NAME" in cluster) {
            cluster = cluster.NAME;
        }
        if (!Array.isArray(attr)) {
            attr = [attr];
        }
        
        try {
            this.log(`Ask attribute`, attr);
            
            const value = await this.zclNode.endpoints[1].clusters[cluster].readAttributes(...attr);
            
            this.log(`Got attr`, attr, value);
            
            try {
                handler(value);
            } catch (handlerError) {
                this.error(`Error in attribute handler:`, handlerError);
            }
        } catch (error) {
            this.error(`Error reading attributes`, attr, error);
        }
    }

    async writeAttribute(cluster, attr, value) {
        const data = {};
        data[attr] = value;
        return this.writeAttributes(cluster, data);
    }

    async writeAttributes(cluster, attribs, filter = null) {
        if ("NAME" in cluster) {
            cluster = cluster.NAME;
        }
        
        const clusterObj = this.zclNode.endpoints[1].clusters[cluster];
        if (!clusterObj) {
            throw new Error(`Cluster ${cluster} not available on this device`);
        }
        
        const items = {};
        
        for (const key in attribs) {
            if (filter && !filter.includes(key))
                continue;
            if (!(key in clusterObj.constructor.attributes))
                continue;
            items[key] = attribs[key];
        }

        if (!Object.keys(items).length) {
            this.log(`Write attribute`, {});
            return;
        }

        this.log(`Write attribute`, items);
        
        try {
            const result = await clusterObj.writeAttributes(items);
            return result;
        } catch (error) {
            this.error(`Error write attr`, items, error);
            throw error;
        }
    }

    onDeleted() {
        this.log(`Sonoff device removed`);
        
        if (this._originalHandleFrame) {
            this.node.handleFrame = this._originalHandleFrame;
            this._originalHandleFrame = null;
            this._handleFrameWrapper = null;
        }
    }

}

module.exports = SonoffBase;
