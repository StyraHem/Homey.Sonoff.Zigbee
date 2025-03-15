'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');

const Attributes = [
    'zoneState',
    'zoneType',
    'zoneStatus'
];

class SQ510A extends ZigBeeDevice {

    async onNodeInit({zclNode}) {
        this.printNode();

        this.configureAttributeReporting([
            {
                endpointId: 1,
                cluster: CLUSTER.IAS_ZONE,
                attributeName: 'zoneStatus',
                minInterval: 0,
                maxInterval: 3600,
                minChange: 1
            }
        ]).catch(this.error);

        zclNode.endpoints[1].clusters[CLUSTER.IAS_ZONE.NAME].onZoneStatusChangeNotification = payload => {
            this.onIASZoneStatusChangeNotification(payload);
        }

        this.checkAttributes();
    }

    onIASZoneStatusChangeNotification({zoneStatus, extendedStatus, zoneId, delay,}) {
        this.log('IASZoneStatusChangeNotification received:', zoneStatus, extendedStatus, zoneId, delay);
        this.setCapabilityValue('alarm_contact', zoneStatus.alarm1).catch(this.error);
        this.setCapabilityValue('alarm_water', zoneStatus.alarm1).catch(this.error);
        this.setCapabilityValue('alarm_battery', zoneStatus.battery).catch(this.error);
    }

    async checkAttributes() {
        try {
            const iasAttributes = await this.zclNode.endpoints[1].clusters[CLUSTER.IAS_ZONE.NAME].readAttributes(Attributes);
            this.log('IAS Zone attributes:', iasAttributes);
        } catch (error) {
            this.error('Error reading attributes:', error);
        }
    }

    onDeleted(){
        this.log("Water Detector removed");
    }
}

module.exports = SQ510A;