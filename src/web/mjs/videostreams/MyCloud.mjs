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
        const sources = await this._getSources();
        return this._extractStream(resolution, sources);
    }

    async _extractStream(resolution, sources) {
        sources = sources.filter(source => source.file.includes('.mp4'));
        return sources.shift().file;
    }

    async getPlaylist(resolution) {
        const sources = await this._getSources();
        return this._extractPlaylist(resolution, sources);
    }

    async _extractPlaylist(resolution, sources) {
        sources = sources.filter(source => source.file.includes('.m3u8'));
        const playlist = sources.shift().file;
        const request = new Request(playlist);
        request.headers.set('x-referer', this._uri.href);
        const streams = await this._fetchRegex(request, /^(.*?\d+\.m3u8)$/gm);
        const stream = (streams.find(s => s.includes(resolution)) || streams[0]).trim();
        return playlist.replace(/[^/]+$/, stream);
    }

    async getStreamAndPlaylist(resolution) {
        const sources = await this._getSources();
        let result = {};
        try {
            result['stream'] = await this._extractStream(resolution, sources);
        } catch(error) {
            //
        }
        try {
            result['playlist'] = await this._extractPlaylist(resolution, sources);
        } catch(error) {
            //
        }
        return result;
    }
}