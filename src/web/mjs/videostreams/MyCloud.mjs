export default class MyCloud {

    constructor(url, referer, fetchRegex) {
        this._uri = new URL(url);
        this._referer = new URL(referer);
        this._fetchRegex = fetchRegex;
    }

    async getPlaylist(resolution) {
        let request = new Request(this._uri, {
            headers: {
                'x-sec-fetch-dest': 'iframe',
                'x-sec-fetch-mode': 'navigate',
                'x-referer': this._referer
            }
        });
        let data = await this._fetchRegex(request, /mediaSources\s*=\s*\[\s*\{\s*"file"\s*:\s*"(.*?)"/g);
        let playlist = data.pop();
        request = new Request(playlist);
        request.headers.set('x-referer', this._uri.href);
        let streams = await this._fetchRegex(request, /^(.*?\d+\.m3u8)$/gm);
        let stream = (streams.find(s => s.includes(resolution)) || streams[0]).trim();
        return playlist.replace(/[^/]+$/, stream);
    }
}