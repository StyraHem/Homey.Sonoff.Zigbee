'use strict';

const { ZigBeeDevice } = require("homey-zigbeedriver");

const SonoffOnOffCluster = require("../../lib/SonoffOnOffCluster");
const { Cluster, CLUSTER, BoundCluster } = require('zigbee-clusters');
Cluster.addCluster(SonoffOnOffCluster);

const SonoffCluster = require("../../lib/SonoffCluster");
Cluster.addCluster(SonoffCluster);

const SonoffBase = require('../sonoffbase');

class MyOnOffBoundCluster extends BoundCluster {
    constructor(node) {
        super();
        this.node = node;
        this._click = node.homey.flow.getDeviceTriggerCard("ZBMINIR2:click");
    }
    toggle() {
        this._click.trigger(this.node, {}, {}).catch(this.node.error);
    }
}

const SonoffClusterAttributes = [
	'power_on_delay_state',
	'power_on_delay_time',
    'switch_mode',
    'detach_mode'
];

class SonoffZBMINIR2 extends SonoffBase {

 /**
   * onInit is called when the device is initialized.
   */
    async onNodeInit({ zclNode }) {
        
        super.onNodeInit({zclNode});

        if (this.hasCapability('onoff')) {
            this.registerCapability('onoff', CLUSTER.ON_OFF);
        }

        this.configureAttributeReporting([			
			{
				endpointId: 1,
				cluster: CLUSTER.ON_OFF,
				attributeName: 'onOff',
                minInterval: 0,
                maxInterval: 3600                
			}
		]).catch(this.error);

        this.zclNode.endpoints[1].bind(CLUSTER.ON_OFF.NAME, new MyOnOffBoundCluster(this));
        
        this.checkAttributes();
    }

    /**
     * onSettings is called when the user updates the device's settings.
     * @param {object} event the onSettings event data
     * @param {object} event.oldSettings The old settings object
     * @param {object} event.newSettings The new settings object
     * @param {string[]} event.changedKeys An array of keys changed since the previous version
     * @returns {Promise<string|void>} return a custom message that will be displayed
     */
    async onSettings({ oldSettings, newSettings, changedKeys }) {
        if (changedKeys.includes("power_on_behavior")) {
            try {
                await this.zclNode.endpoints[1].clusters.onOff.writeAttributes({ powerOnBehavior: newSettings.power_on_behavior });
            } catch (error) {
                this.log("Error updating the power on behavior");
            }
        }

        this.writeAttributes(SonoffCluster, newSettings, changedKeys).catch(this.error);


        // if (changedKeys.includes('switch_type')) {
        //     try {
        //         // TODO: apparently readonly?
        //         await this.zclNode.endpoints[1].clusters.onOffSwitch.writeAttributes({ switchType: newSettings.switch_type });
        //     } catch (error) {
        //         this.log("Error updating the switch type");
        //     }
        // }
  }

  async checkAttributes() {
    
    this.readAttribute(CLUSTER.ON_OFF, ['powerOnBehavior'], (data) => {
        this.setSettings({ power_on_behavior: data.powerOnBehavior }).catch(this.error); //, switch_type: switchType });
    });
    
    this.readAttribute(SonoffCluster, SonoffClusterAttributes, (data) => {
        this.setSettings(data).catch(this.error);
    });
    
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
    async onDeleted() {
        this.log("smartswitch removed");
    }

}

module.exports = SonoffZBMINIR2;
