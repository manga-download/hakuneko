// See also: https://github.com/billythekids/plugin.video.bimozie/blob/master/resources/lib/utils/hosts/hydrax.py
export default class HydraX {

    constructor(url, slug, key) {
        this._uri = new URL(url);
        this._slug = slug || this._uri.searchParams.get('v');
        this._key = key;
    }

    _getStream(streams, resolution) {
        let streamMap = [
            { resolution: 360, data: streams.sd },
            { resolution: 480, data: streams.mhd },
            { resolution: 720, data: streams.hd },
            { resolution: 1080, data: streams.fullhd },
            { resolution: 9999, data: streams.origin }
        ].filter(stream => stream.data !== undefined);
        if(!Number.isNaN(resolution)) {
            let index = streamMap.findIndex(stream => stream.resolution >= resolution);
            if(index > -1) {
                return streamMap[index].data;
            }
        }
        return streamMap.pop().data;
    }

    async _getSources(host) {
        let uri = new URL(this._uri.protocol + '//' + host);
        let request = new Request(uri, {
            method: 'POST',
            body: 'slug=' + this._slug,
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'x-referer': this._uri.href
            }
        });
        let response = await fetch(request);
        let data = await response.json();
        return data.sources;
    }

    _decodeURL(url) {
        if (url && !/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(url)) {
            return atob(url.slice(-1) + url.slice(0, -1));
        }
        return url;
    }

    async _getPlaylistGuest() {
        let uri = new URL('https://ping.idocdn.com/');
        let request = new Request(uri, {
            method: 'POST',
            body: 'slug=' + this._slug,
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'x-referer': this._uri.href
            }
        });
        let response = await fetch(request);
        let data = await response.json();
        data.url = this._decodeURL(data.url);
        let sources = data.sources || await this._getSources(data.url);
        return sources.reduce((accumulator, source) => {
            accumulator[source] = [
                this._uri.protocol + '//',
                source === 'hd' ? 'www' : '',
                this._slug.toLowerCase(),
                '.',
                data.url
            ].join('');
            return accumulator;
        }, {});
    }

    async _getPlaylistVip() {
        throw new Error('HydraX VIP streams are not yet supported by HakuNeko!');
    }

    async getPlaylist(resolution) {
        let streams = this._key ? await this._getPlaylistVip() : await this._getPlaylistGuest();
        return this._getStream(streams, resolution);
    }
}