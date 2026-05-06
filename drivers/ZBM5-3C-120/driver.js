'use strict';

const { ZigBeeDriver } = require('homey-zigbeedriver');

const RootDevice = require('./device.js');
const Gang2Device = require('./gang2.device.js');
const Gang3Device = require('./gang3.device.js');

class SonoffZBM5_3C_Driver extends ZigBeeDriver {

    onMapDeviceClass(device) {
        const subDeviceId = device.getData().subDeviceId;
        if (subDeviceId === 'gang2') {
            return Gang2Device;
        }
        if (subDeviceId === 'gang3') {
            return Gang3Device;
        }
        return RootDevice;
    }

}

module.exports = SonoffZBM5_3C_Driver;
