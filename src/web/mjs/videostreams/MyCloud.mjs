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
        sources = sources.filter(source => source.file.endsWith('.mp4'));
        if(resolution) {
            sources = sources.filter(source => source.file.includes(resolution));
        }
        const other = sources.find(s => !s.file.includes('google'));
        const gdrive = sources.find(s => s.file.includes('google'));
        return (other || gdrive).file;
    }

    async getPlaylist(resolution) {
        const sources = await this._getSources();
        return this._extractPlaylist(resolution, sources);
    }

    async _extractPlaylist(resolution, sources) {
        sources = sources.filter(source => source.file.endsWith('.m3u8'));
        const playlist = sources[0].file;
        const request = new Request(playlist);
        request.headers.set('x-referer', this._uri.href);
        const streams = await this._fetchRegex(request, /^(.*?\d+\.m3u8)$/gm);
        const stream = !resolution ? streams[0] : streams.find(s => s.includes(resolution));
        return playlist.replace(/[^/]+$/, stream.trim());
    }

    async getStreamAndPlaylist(resolution) {
        const sources = await this._getSources();
        let result = {};
        try {
            result['stream'] = await this._extractStream(resolution, sources);
        } catch(error) {
            // Failed to find a matching MP4 stream for the given resolution
        }
        try {
            result['playlist'] = await this._extractPlaylist(resolution, sources);
        } catch(error) {
            // Failed to find a matching HLS playlist for the given resolution
        }
        if(result['stream'] || result['playlist']) {
            return result;
        }
        try {
            result['stream'] = await this._extractStream(Number.NaN, sources);
        } catch(error) {
            // Failed to find any MP4 stream
        }
        try {
            result['playlist'] = await this._extractPlaylist(Number.NaN, sources);
        } catch(error) {
            // Failed to find any HLS playlist
        }
        return result;
    }
}