export default class Streamtape {

    constructor(url) {
        this._uri = new URL(url);
    }

    async getStream() {
        const script = `
            new Promise(resolve => {
                for(let count = 0; count < 3; count++) {
                    document.querySelector('.plyr-overlay').click();
                }
                resolve(new URL(document.getElementById('mainvideo').src, window.location.origin).href);
            });
        `;
        const request = new Request(this._uri);
        return Engine.Request.fetchUI(request, script);
    }
}