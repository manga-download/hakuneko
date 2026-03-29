export default class MP4Upload {

    constructor(url) {
        this._uri = new URL(url);
    }

    async getStream() {
        let script = `
            new Promise(resolve => {
                resolve(document.querySelector('div#player video').src);
            });
        `;
        let request = new Request(this._uri);
        return Engine.Request.fetchUI(request, script);
    }
}