'use strict';

const { RFSignal, RFError, RFUtil } = require('homey-rfdriver');

// Protocol:
// [ 0x00 - 0xFF, 0x00 | 0xFF ]
// [ address    , state       ]

module.exports = class MySignal extends RFSignal {

  static FREQUENCY = '433';
  static ID = 'sonoff_rf';

  // This method converts a JavaScript object command
  // into a payload for our signal.
  static commandToPayload({ address, state }) {
    if( typeof address !== 'number' )
      throw new RFError('Invalid Address');

    if( typeof state !== 'boolean' )
      throw new RFError('Invalid State');
      
    return [ address, state ? 0x00 : 0xFF ];
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
      address: command.address,
    };
  }

  // This method is invoked when a new receiver is added
  // We can generate a random address, as if someone pressed
  // the button on a remote.
  static createPairCommand() {
    return {
      address: Math.round(Math.random() * 255),
      state: true,
    };
  }

}