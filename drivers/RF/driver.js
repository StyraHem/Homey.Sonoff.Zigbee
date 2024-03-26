'use strict';

const { RFDriver } = require('homey-rfdriver');
const RfSignal = require('../../lib/RfSignal');

module.exports = class MyRFDriver extends RFDriver {

  static SIGNAL = RfSignal;

  async onRFInit() {
    this.enableRX(this.receive.bind(this))
  }

  async receive (command, { isFirst }) {
    this.log("RF receive " + command.bits + " " + command.hex);
  }
}