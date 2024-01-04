"use strict";

const { ZigBeeLightDevice } = require('homey-zigbeedriver');

class Light extends ZigBeeLightDevice {

 	async onNodeInit({zclNode}) {

        await super.onNodeInit({zclNode});

    }
}

module.exports = Light;
