const { OnOffCluster, ZCLDataTypes } = require('zigbee-clusters');

class SonoffOnOffCluster extends OnOffCluster {

  static get ATTRIBUTES() {
    return {
      ...super.ATTRIBUTES,
      powerOnBehavior: {
          id: 16387,
          type: ZCLDataTypes.enum8({
            off: 0, // OFF (0) - off after power loss
            on: 1, // ON (1) - on after power loss with configured level (bri), color temp, color (default)
            toggle: 2, // TOGGLE (2) - toggle power state after power loss
            last_state: 255, // SET_PREVIOUS (255) - on after power loss with last state
          })
      },
    };
  }

}

module.exports = SonoffOnOffCluster;