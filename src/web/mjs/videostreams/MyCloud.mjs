export default class MyCloud {

    constructor(url, referer, fetchRegex) {
        this._uri = new URL(url);
        this._referer = new URL(referer);
        this._fetchRegex = fetchRegex;
    }

    _getBestSource(sources) {
        return sources.pop().file;
    }

    async getPlaylist(resolution) {
        let request = new Request(this._uri.href.replace('/embed/', '/info/'), {
            headers: {
                'x-referer': this._uri.href,
                'x-requested-with': 'XMLHttpRequest'
            }
        });
        let response = await fetch(request);
        let data = await response.json();
        let playlist = this._getBestSource(data.media.sources);
        request = new Request(playlist);
        request.headers.set('x-referer', this._uri.href);
        let streams = await this._fetchRegex(request, /^(.*?\d+\.m3u8)$/gm);
        let stream = (streams.find(s => s.includes(resolution)) || streams[0]).trim();
        return playlist.replace(/[^/]+$/, stream);
    }
}