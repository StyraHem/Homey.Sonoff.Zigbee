const { RFDevice } = require('homey-rfdriver');

module.exports = class MyRFDevice extends RFDevice {

  static RX_ENABLED = true; // Set to true for transmitter devices

  async onRFInit() {
    this._receiveTrigger = this.homey.flow.getDeviceTriggerCard("on_receive");
    this.registerCapabilityListener('button', async () => {
      const data = await this.getData();      
      this.driver.tx({code:data.code}, {device:this});
    });

    this.log("Init")
  }

  async onCommandFirst(command, { ...flags } = {}) {
    this._receiveTrigger.trigger(this)
      .then(this.log("Receive trigged"))
      .catch(this.error);
  }

  async onCommandMatch(command) {
    const signal = await this.driver.getRFSignal();
    const currentDeviceData = await this.getData();
    const commandDeviceData = signal.constructor.commandToDeviceData(command);
    return currentDeviceData.code==commandDeviceData.code;
  }

}