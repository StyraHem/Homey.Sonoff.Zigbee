const { OnOffSwitchCluster, ZCLDataTypes } = require('zigbee-clusters');

class SonoffOnOffSwitchCluster extends OnOffSwitchCluster {

  static get ATTRIBUTES() {
    return {
      ...super.ATTRIBUTES,
      switchType: {
          id: 0,
          type: ZCLDataTypes.enum8({
            toggle: 0,
            momentary: 1
          })
      },
      switchAction: {
        id: 16,
        type: ZCLDataTypes.enum8({})
    },
    };
  }

}

module.exports = SonoffOnOffSwitchCluster;
