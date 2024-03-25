const { Cluster, ZCLDataTypes } = require("zigbee-clusters");

class SonoffIlluminationCluster extends Cluster {

    static get ID() {
        return 64529;
    }
    
    static get NAME() {
        return 'SonoffIlluminationCluster';
    }
    
    static get ATTRIBUTES() {
        return {
            illuminance: {
                id: 8193,
                type: ZCLDataTypes.uint8,
                manufacturerId: 0x1234,
            },
        };
    }
}

module.exports = SonoffIlluminationCluster;