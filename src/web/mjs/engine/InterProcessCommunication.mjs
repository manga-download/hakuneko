export default class InterProcessCommunication {

    constructor() {
        this._ipc = require('electron').ipcRenderer;
    }

    listen(channel, handler) {
        this._ipc.on(channel, async (event, responseChannelID, payload) => {
            try {
                let data = await handler(payload);
                event.sender.send(responseChannelID, data);
            } catch(error) {
                console.error(error);
                event.sender.send(responseChannelID, undefined);
            }
        });
    }
}