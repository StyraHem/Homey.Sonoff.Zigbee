"use strict";

const Homey = require("homey");

/*if (process.env.DEBUGPRO === "1") {
   const inspector = require('inspector');
   inspector.close();
   inspector.open(9331, '0.0.0.0', true);
}*/

if (process.env.DEBUG === "1") {
  const inspector = require('inspector');
  if (!inspector.url()) {
    inspector.open(9333, '0.0.0.0', true);
  }
  inspector.waitForDebugger();
}

class SonoffZigbeeApp extends Homey.App {
  onInit() {
    this.log("Sonoff Zigbee - StyraHem, initiating...");
  }
}

module.exports = SonoffZigbeeApp;
