'use strict';

const { ZigBeeDriver } = require('homey-zigbeedriver');

const RootDevice = require('./device.js');
const Gang2Device = require('./gang2.device.js');

class SonoffZBM5_2C_Driver extends ZigBeeDriver {

    onMapDeviceClass(device) {
        const subDeviceId = device.getData().subDeviceId;
        if (subDeviceId === 'gang2') {
            return Gang2Device;
        }
        return RootDevice;
    }

}

module.exports = SonoffZBM5_2C_Driver;
