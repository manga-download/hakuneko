// See also: https://github.com/billythekids/plugin.video.bimozie/blob/master/resources/lib/utils/hosts/hydrax.py
export default class HydraX {
    /*
     * view-source:https://playhydrax.com/?v=HUId0tN4U
     * view-source:https://replay.watch/hydrax.html?vc=1#slug=P867lRn1s
     * view-source:https://hydrax.net/watch?v=REWojk-ld&autostart=true
     */
    constructor(url, slug, key) {
        this._uri = new URL(url);
        this._slug = slug || this._uri.searchParams.get('v');
        this._key = key;
        this._N = {
            protocol: this._uri.protocol
        };
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

    async _getPacketURL(redirectLink, retryCount) {
        retryCount = retryCount || 0;
        let uri = new URL(redirectLink);
        uri.pathname = uri.pathname.replace('/redirect/', '/html/') + '.html';
        uri.searchParams.set('domain', this._uri.hostname);
        let request = new Request(uri, {
            method: 'GET',
            mode: 'cors',
            headers: new Headers({
                //'x-referer': this._uri.href,
                'x-origin': this._uri.origin
            })
        });
        let response = await fetch(request);
        if(response.status === 403 && retryCount < 10) {
            let delay = parseInt(1000 * (retryCount + Math.random()));
            await new Promise(resolve => setTimeout(resolve, delay));
            return this._getPacketURL(redirectLink, retryCount + 1);
        }
        if(response.status !== 200) {
            throw new Error('Failed to get redirect URL for stream packet!');
        }
        let data = await response.json();
        return atob(data.url);
    }

    async _replaceRedirectLinks(playlist) {
        let redirects = [... new Set(playlist.split('\n').filter(line => line.startsWith('http')))];
        // TODO: maybe spamming requests leads to many 404 errors?
        redirects = await Promise.all(redirects.map(async redirect => {
            return {
                source: redirect,
                target: await this._getPacketURL(redirect)
            };
        }));
        for(let redirect of redirects) {
            if(redirect.target.includes('googleapis.com')) {
                let uri = new URL(redirect.target);
                redirect.target = redirects.find(r => r.target.startsWith(uri.origin + uri.pathname)).target;
            }
            playlist = playlist.split(redirect.source).join(redirect.target);
        }
        return playlist;
    }

    async _optimizePlaylist(playlist) {
        return playlist;
    }

    _setupEncryptionKey(stream, playlist) {
        if(stream.hash && stream.iv) {
            playlist = playlist.replace(/#EXT-X-HASH:.*/, `#EXT-X-KEY:METHOD=AES-128,URI="data:application/octet-stream;base64,${stream.hash}",IV=${stream.iv}`);
        }
        return playlist;
    }

    async _getPlaylistGuest() {
        let form = new URLSearchParams();
        form.append('slug', this._slug);
        let request = new Request('https://multi.idocdn.com/guest', {
            method: 'POST',
            body: form.toString(),
            headers: new Headers({
                'content-type': 'application/x-www-form-urlencoded',
                'x-referer': this._uri.href
            })
        });
        let response = await fetch(request);
        return response.json();
    }

    async _getPlaylistVip() {
        let form = new URLSearchParams();
        form.append('key', this._key);
        form.append('type', 'slug');
        form.append('value', this._slug);
        let request = new Request('https://multi.idocdn.com/vip', {
            method: 'POST',
            body: form.toString(),
            headers: new Headers({
                'content-type': 'application/x-www-form-urlencoded',
                'x-referer': this._uri.href
            })
        });
        let response = await fetch(request);
        return response.json();
    }

    async getPlaylist(resolution) {
        let data = this._key ? await this._getPlaylistVip() : await this._getPlaylistGuest();
        if(data.msg) {
            throw new Error(data.msg);
        }
        let stream = this._getStream(data, resolution);
        let playlist = this.fa(stream, data.servers);
        playlist = this._setupEncryptionKey(stream, playlist);
        playlist = await this._replaceRedirectLinks(playlist);
        playlist = await this._optimizePlaylist(playlist);
        let utf8 = new TextEncoder('utf-8');
        let blob = new Blob([ utf8.encode(playlist) ], { type: 'application/x-mpegURL' });
        return URL.createObjectURL(blob);
    }

    // original source from: https://iamcdn.net/players/player.min.js
    fa(t, e) {
        let N = this._N;
        var n = "#EXTM3U\n#EXT-X-VERSION:4\n#EXT-X-PLAYLIST-TYPE:VOD\n#EXT-X-TARGETDURATION:" + t.duration + "\n#EXT-X-MEDIA-SEQUENCE:0\n";
        void 0 !== t.hash && t.hash && (n += "#EXT-X-HASH:" + t.hash + "\n");
        var i = 0,
            r = 0,
            o = t.id || null,
            a = t.ids || null,
            c = t.expired || t.sig || null,
            s = t.datas || null,
            u = t.ranges || null,
            l = u ? u.length : 0;
        if (s) {
            o = e.length;
            for (var h = 0; h < l; h++) {
                for (var f, d = s[h].file, p = 0; p < u[h].length; p++) {
                    var y = l <= h + p + 1 ? l <= p + 1 ? s[0].file : s[p + 1].file : s[h + p + 1].file;
                    i < o ? (f = e[i], i++) : (i = 1, f = e[0]), a = u[h][p], f = N.protocol + "//" + f, n += "#EXTINF:" + t.extinfs[r] + ",\n", n += "#EXT-X-BYTERANGE:" + a + "\n", n = c ? n + (f + "/") + c + "/" + d + "/" + a + "/" + y + "\n" : n + (f + "/") + r + "/" + d + "/" + a + "/" + y + "\n", r++;
                }
                l == h + 1 && (n += "#EXT-X-ENDLIST");
            }
        } else if (a)
            if (u)
                for (h = 0; h < l; h++) {
                    for (d = a[h], p = 0; p < u[h].length; p++) y = l <= h + p + 1 ? l <= p + 1 ? a[0] : a[p + 1] : a[h + p + 1], "object" == typeof e.redirect ? i < e.redirect.length ? (s = e.redirect[i], i++) : (i = 1, s = e.redirect[0]) : s = e.redirect, n += "#EXTINF:" + t.extinfs[r] + ",\n", 1 < u[h].length && (n += "#EXT-X-BYTERANGE:" + u[h][p] + "\n"), n += N.protocol + "//" + s + "/redirect/" + c + "/" + o + "/" + d + "/" + y + "\n", r++;
                    l == h + 1 && (n += "#EXT-X-ENDLIST");
                } else
                for (h = 0; h < a.length; h++) d = a[h], y = a.length <= h + 1 && a.length <= h + 1 ? a[0] : a[h + 1], "object" == typeof e.redirect ? i < e.redirect.length ? (s = e.redirect[i], i++) : (i = 1, s = e.redirect[0]) : s = e.redirect, n += "#EXTINF:" + t.extinfs[r] + ",\n", n += N.protocol + "//" + s + "/redirect/" + c + "/" + o + "/" + d + "/" + y + "\n", r++, a.length == h + 1 && (n += "#EXT-X-ENDLIST");
        /*
         *return i = new TextEncoder("utf-8"), URL.createObjectURL(new Blob([i.encode(n)], {
         *    type: "application/x-mpegURL"
         *})) + "#" + t.id + "\n"
         */
        return n;
    }
}