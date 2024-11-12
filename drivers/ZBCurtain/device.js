'use strict';

const { ZigBeeDevice } = require("homey-zigbeedriver");
const { Cluster, CLUSTER } = require('zigbee-clusters');

class SonoffZBCurtain extends ZigBeeDevice {

    async onNodeInit({ zclNode }) {
        super.onNodeInit({zclNode});

        this.log('Sonoff ZBCurtain init');
        
        this.registerCapability('measure_battery', CLUSTER.POWER_CONFIGURATION, {
            report: 'batteryPercentageRemaining',
            reportParser(value) {
                return value && ( value / 2 );
            }
        });

        this.registerCapability('windowcoverings_state', CLUSTER.WINDOW_COVERING);

        this.registerCapability('windowcoverings_set', CLUSTER.WINDOW_COVERING, {
            set: 'goToLiftPercentage',            
            report: 'currentPositionLiftPercentage',
            setParser(value) {
                return { percentageLiftValue: Math.round(value * 100)};
            },
            reportParser(value) {
                return value / 100;
            }
        });
    }

}

module.exports = SonoffZBCurtain;
