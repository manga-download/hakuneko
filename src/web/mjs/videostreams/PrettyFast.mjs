export default class PrettyFast {

    constructor(url, referer) {
        this._uri = new URL(url);
        this._referer = new URL(referer);
    }

    async getPlaylist(/*resolution*/) {
        let request = new Request(this._uri.href, this.requestOptions);
        request.headers.set('x-referer', this._referer.href);
        let response = await fetch(request);
        let data = await response.text();
        return data.match(/hlsUrl\s*=\s*['"]([^'"]+)['"]/)[1];
    }
}