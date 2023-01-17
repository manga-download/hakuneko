export default class SendVid {

    constructor(url) {
        this._uri = new URL(url);
    }

    async getStream() {
        const script = `
            new Promise(resolve => {
                resolve(video_source);
            });
        `;
        const request = new Request(this._uri);
        return Engine.Request.fetchUI(request, script);
    }
}