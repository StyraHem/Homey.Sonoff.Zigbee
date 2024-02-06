'use strict';

//const Homey = require('homey');
const SonoffBase = require('./sonoffbase');
const { CLUSTER, BoundCluster } = require('zigbee-clusters');

class PushButtonBoundCluster extends BoundCluster {
    constructor(node) {
        super();
        this.node = node; 
		var prefix = this.node.driver.id + ":";
        this._single_click = node.homey.flow.getDeviceTriggerCard(prefix + "single_click");
        this._double_click = node.homey.flow.getDeviceTriggerCard(prefix + "double_click");
        this._long_click = node.homey.flow.getDeviceTriggerCard(prefix + "long_click");
    }
    toggle() {
        this._single_click.trigger(this.node, {}, {}).catch(this.node.error);
        this.node.checkBattery();
    }
    setOn() {        
        this._double_click.trigger(this.node, {}, {}).catch(this.node.error);
        this.node.checkBattery();
    }
    setOff() {        
        this._long_click.trigger(this.node, {}, {}).catch(this.node.error);
        this.node.checkBattery();
    }
}

class PushButton extends SonoffBase {

	async onNodeInit({zclNode}) {
		super.onNodeInit({zclNode});
		zclNode.endpoints[1].bind('onOff', new PushButtonBoundCluster(this));
	}	
}

module.exports = PushButton;