export default class StreamSB {
    constructor(url) {
        this._uri = new URL(url);
    }
    async getStream() {
        const script = `
        new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    for(let count = 0; count < 3; count++) {
                        document.querySelector('[aria-label="Play"]').click();
                    }
                    resolve(player.getConfig());
                }
                catch(error) {
                    reject(error);
                }
            },
            3000);
        });
        `;
        const request = new Request(this._uri);
        const playercfg = await Engine.Request.fetchUI(request, script, 10000);
        return playercfg.playlist[0].file;
    }
}