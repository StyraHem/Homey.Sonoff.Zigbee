"use strict";

const Homey = require("homey");

/*if (process.env.DEBUGPRO === "1") {
   const inspector = require('inspector');
   inspector.close();
   inspector.open(9331, '0.0.0.0', true);
}*/

if (process.env.DEBUG === "1X") {
  const inspector = require('inspector');
  if (!inspector.url()) {
    inspector.open(9330, '0.0.0.0', true);
  }
  inspector.waitForDebugger();
}

class SonoffZigbeeApp extends Homey.App {
  onInit() {
    this.log("Sonoff Zigbee - StyraHem, initiating...");

    // Register global Action Card to update switch UI without hardware interaction
    this.homey.flow.getActionCard('set_ui_onoff')
      .registerRunListener(async (args, state) => {
        let newValue;
        if (args.status === 'toggle') {
            newValue = !args.device.getCapabilityValue('onoff');
        } else {
            newValue = args.status === 'on';
        }
        await args.device.setCapabilityValue('onoff', newValue);
        return true;
      });
  }
}

module.exports = SonoffZigbeeApp;
