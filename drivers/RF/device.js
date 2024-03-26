const { RFDevice } = require('homey-rfdriver');

module.exports = class MyRFDevice extends RFDevice {

  static RX_ENABLED = false; // Set to true for transmitter devices

  static CAPABILITIES = {

    // When the onoff capability is changed by the user,
    // you can assemble a command here.
    // 'data' is your device's data object
    onoff: ({ value, data }) => ({
      address: data.address,
      state: value === true,
    }),
  };

  async onRFInit() {
    this.log("Init")
  }

}