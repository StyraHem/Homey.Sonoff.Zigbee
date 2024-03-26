"use strict";

const Homey = require("homey");

// if (process.env.DEBUGPRO === "1") {
//   const Inspector =  require('inspector');
//   Inspector.close();
//   Inspector.open(9331, '0.0.0.0', true);
// }
if (process.env.DEBUG) {
  require('inspector').waitForDebugger();
}

class SonoffZigbeeApp extends Homey.App {
  onInit() {
    this.log("Sonoff Zigbee - StyraHem, initiating...");
  }
}

module.exports = SonoffZigbeeApp;
