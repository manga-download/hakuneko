export default class Kwik {

    constructor(url, referer) {
        this._uri = new URL(url);
        this._referer = new URL(referer);
    }

    async getPlaylist(/*resolution*/) {
        let script = `new Promise(resolve => resolve(hls.url))`;
        let request = new Request(this._uri.href, this.requestOptions);
        request.headers.set('x-referer', this._referer.href);
        return Engine.Request.fetchUI(request, script);
    }
}