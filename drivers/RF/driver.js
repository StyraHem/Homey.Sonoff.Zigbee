'use strict';

const { RFDriver } = require('homey-rfdriver');
const RfSignal = require('../../lib/RfSignal');

module.exports = class MyRFDriver extends RFDriver {

  static SIGNAL = RfSignal;

  async onRFInit() {
    this._rfTrigger = this.homey.flow.getTriggerCard('sonoff_rf');
    this._rfTrigger.registerRunListener(async (args, state) => {
      const match = args.code === '' ||
          args.code.toUpperCase() === state.code.toUpperCase();
      return  match;        
    });
    this.enableRX(this.receive.bind(this))
  }

  async receive (command, { isFirst }) {
    if (isFirst) {
      this._rfTrigger.trigger({code:command.hex},{code:command.hex}).then(this.log("Sent global trigger")).catch(this.error);
    }
    this.log("RF receive " + command.bits + " " + command.hex);
  }
}