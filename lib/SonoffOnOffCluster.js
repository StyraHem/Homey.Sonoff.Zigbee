const { OnOffCluster, ZCLDataTypes } = require('zigbee-clusters');

class SonoffOnOffCluster extends OnOffCluster {

  static get ATTRIBUTES() {
    return {
      ...super.ATTRIBUTES,
      powerOnBehavior: {
          id: 16387, // 0x4003
          type: ZCLDataTypes.enum8({
            off: 0,         // OFF (0) - off after power loss
            on: 1,          // ON (1) - on after power loss
            toggle: 2,      // TOGGLE (2) - toggle power state after power loss
            last_state: 255 // SET_PREVIOUS (255) - restore last state after power loss
          })
      },
    };
  }

}

module.exports = SonoffOnOffCluster;
