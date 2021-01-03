export default class MyCloud {

    constructor(url, referer, fetchRegex) {
        this._uri = new URL(url);
        this._referer = new URL(referer);
        this._fetchRegex = fetchRegex;
    }

    async _getSources() {
        const request = new Request(this._uri.href.replace('/embed/', '/info/'), {
            headers: {
                'x-referer': this._uri.href,
                'x-requested-with': 'XMLHttpRequest'
            }
        });
        const response = await fetch(request);
        const data = await response.json();
        return data.media.sources;
    }

    async getStream(resolution) {
        let sources = await this._getSources();
        sources = sources.filter(source => source.includes('.mp4'));
        const stream = sources.shift().file;
    }

    async getPlaylist(resolution) {
        let sources = await this._getSources();
        sources = sources.filter(source => source.includes('.m3u8'));
        const playlist = sources.shift().file;
        const request = new Request(playlist);
        request.headers.set('x-referer', this._uri.href);
        let streams = await this._fetchRegex(request, /^(.*?\d+\.m3u8)$/gm);
        let stream = (streams.find(s => s.includes(resolution)) || streams[0]).trim();
        return playlist.replace(/[^/]+$/, stream);
    }
}