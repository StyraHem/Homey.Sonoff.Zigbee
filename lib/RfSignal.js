'use strict';

const { RFSignal, RFError, RFUtil } = require('homey-rfdriver');

module.exports = class MySignal extends RFSignal {

  static FREQUENCY = '433';
  static ID = 'sonoff_rf';

  // This method converts a JavaScript object command
  // into a payload for our signal.
  static commandToPayload(cmd) {
    if( typeof cmd.code !== 'string' )
      throw new RFError('Invalid code');
    const num = parseInt(cmd.code, 16);
    return RFUtil.numberToBitArray(num, 24);
  }

  // This method converts a received payload
  // into a JavaScript object command.
  static payloadToCommand(payload) {
    const bits = payload.join("");
    const num = parseInt(bits, 2);
    const hex = num.toString(16);
    return { bits, num, hex };
  }

  // This method takes a command object
  // and returns a device-unique data object
  static commandToDeviceData(command) {
    return {
      code: command.hex,
    };
  }

  // This method is invoked when a new receiver is added
  // We can generate a random address, as if someone pressed
  // the button on a remote.
  static createPairCommand() {
    return {
      code: Math.round(Math.random() * 255)
    };
  }

}