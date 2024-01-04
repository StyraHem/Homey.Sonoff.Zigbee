"use strict";

const Homey = require("homey");

class MyZigbeeApp extends Homey.App {
  onInit() {
    this.log("My Zigbee App initiating...");
  }
}

module.exports = MyZigbeeApp;
