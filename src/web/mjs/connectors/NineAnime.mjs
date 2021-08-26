import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
import PrettyFast from '../videostreams/PrettyFast.mjs';
import Streamtape from '../videostreams/Streamtape.mjs';
import MyCloud from '../videostreams/MyCloud.mjs';
import Vidstream from '../videostreams/Vidstream.mjs';
import HydraX from '../videostreams/HydraX.mjs';
import MP4Upload from '../videostreams/MP4Upload.mjs';

export default class NineAnime extends Connector {

    constructor() {
        super();
        super.id = '9anime';
        super.label = '9ANIME';
        this.tags = [ 'anime', 'english' ];
        this.url = 'https://9anime.to';
        this.requestOptions.headers.set('x-requested-with', 'XMLHttpRequest');
        this.requestOptions.headers.set('x-cookie', 'player_autoplay=0');

        this.config = {
            resolution:  {
                label: 'Preferred Resolution',
                description: 'Try to download video in the selected resolution.\nIf the resolution is not supported, depending on the mirror the download may fail, or a fallback resolution may be used!',
                input: 'select',
                options: [
                    { value: '', name: 'Mirror\'s Default' },
                    { value: '480', name: '480p' },
                    { value: '720', name: '720p' },
                    { value: '1080', name: '1080p' }
                ],
                value: ''
            },
            throttle: {
                label: 'Video Stream Throttle [ms]',
                description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests while downloading packets from the video stream.\nThe download may fail if there are too many packets requested within a certain interval.',
                input: 'numeric',
                min: 100,
                max: 10000,
                value: 1000
            }
        };
    }

    canHandleURI(uri) {
        return /https?:\/\/(w+\d*.)?9anime.to/.test(uri.origin);
    }

    async _initializeConnector() {
        let uri = new URL(this.url);
        let request = new Request(uri.href, this.requestOptions);
        this.url = await Engine.Request.fetchUI(request, `window.location.origin`);
        console.log(`Assigned URL '${this.url}' to ${this.label}`);
        this.wait(5000);
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let response = await fetch(request);
        let data = await response.text();
        if(/waf-verify/i.test(data)) {
            throw new Error('The website is protected by captcha, please use manual website interaction to bypass the captcha for the selected anime!');
        }
        let dom = this.createDOM(data);
        let metaURL = dom.querySelector('meta[property="og:url"]').content.trim();
        let metaTitle = dom.querySelector('div.info h1[data-jtitle].title');
        let id = this.getRootRelativeOrAbsoluteLink(metaURL, this.url);
        let title = metaTitle.dataset.jtitle.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/filter', this.url);
        uri.searchParams.set('keyword', '');
        uri.searchParams.set('sort', 'default');
        uri.searchParams.set('page', page);
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.anime-list li a.name');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let script = `
            new Promise((resolve, reject)  => {
                localStorage.setItem('player_autoplay', 0);
                setInterval(() => {
                    try {
                        if(document.querySelector('div#episodes div.servers')) {
                            let servers = [...document.querySelectorAll('div.servers span[id^="server"]')].map(element => {
                                return {
                                    id: element.dataset.id,
                                    label: element.textContent.trim()
                                };
                            });
                            let episodes = [...document.querySelectorAll('div.body ul.episodes li a')].map(element => {
                                return {
                                    servers: JSON.parse(element.dataset.sources),
                                    label: element.textContent.trim()
                                };
                            });
                            let result = servers.reduce((accumulator, server) => {
                                return accumulator.concat(episodes.map(episode => {
                                    return {
                                        id: episode.servers[server.id],
                                        title: episode.label + ' [' + server.label + ']'
                                    };
                                }));
                            }, []);
                            resolve(result);
                        }
                    } catch(error) {
                        reject(error);
                    }
                }, 500);
            });
        `;
        let request = new Request(this.url + manga.id, this.requestOptions);
        return Engine.Request.fetchUI(request, script, null, true);
    }

    async _getPages(chapter) {

        const referer = this.url + chapter.manga.id;
        let uri = new URL('/ajax/anime/episode?id=' + chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        // extracted from 9anime
        const alphabet = 'CpzSkaYEbo7JW3eDjRr5ls2/tQBFivHdAcI+UPGf48qwu16xngVOKmMLZTN0hXy9'; // TODO: alphabet changes in regular intervals (ecry hour?)
        function decode(t) {
            for (var r, x = '', u = 0, e = 0, c = 0; c < t.length; c++) {
                u <<= 6;
                u |= (r = alphabet.indexOf(t[c])) < 0 ? null : r;
                if((e += 6) === 24) {
                    x += String.fromCharCode((16711680 & u) >> 16);
                    x += String.fromCharCode((65280 & u) >> 8);
                    x += String.fromCharCode(255 & u);
                    u = e = 0;
                }
            }
            return 12 === e ? (u >>= 4,
            x += String.fromCharCode(u)) : 18 === e && (u >>= 2,
            x += String.fromCharCode((65280 & u) >> 8),
            x += String.fromCharCode(255 & u)),
            x;
        }
        // extracted from 9anime
        data = (function decrypt(t, n) {
            for (var i, r = [], u = 0, x = '', e = 256, o = 0; o < e; o += 1)
                r[o] = o;
            for (o = 0; o < e; o += 1)
                u = (u + r[o] + t.charCodeAt(o % t.length)) % e,
                i = r[o],
                r[o] = r[u],
                r[u] = i;
            for (var c = u = o = 0; c < n.length; c += 1)
                u = (u + r[o = (o + c) % e]) % e,
                i = r[o],
                r[o] = r[u],
                r[u] = i,
                x += String.fromCharCode(n.charCodeAt(c) ^ r[(r[o] + r[u]) % e]);
            return x;
        })(data.url.slice(0, 16), decode(data.url.slice(16)));

        await this.wait(500);

        switch(true) {
            case data.includes('prettyfast'):
                return this._getEpisodePrettyFast(data, referer, this.config.resolution.value);
            case data.includes('hydrax'):
                return this._getEpisodeHydraX(data, this.config.resolution.value);
            case data.includes('rapidvid'):
                return this._getEpisodeRapidVideo(data, this.config.resolution.value);
            case data.includes('openload'):
                return this._getEpisodeOpenLoad(data, this.config.resolution.value);
            case data.includes('mcloud'):
                return this._getEpisodeMyCloud(data, referer, this.config.resolution.value);
            case data.includes('vidstream'):
                return this._getEpisodeVidstream(data, referer, this.config.resolution.value);
            case data.includes('mp4upload'):
                return this._getEpisodeMp4upload(data, this.config.resolution.value);
            case data.includes('streamango'):
                return this._getEpisodeStreamango(data, this.config.resolution.value);
            case data.includes('streamtape'):
                return this._getEpisodeStreamtape(data, this.config.resolution.value);
            default:
                throw new Error('Support for video stream from mirror "' + data + '" not implemented!');
        }
    }

    async _getEpisodePrettyFast(link, referer, resolution) {
        let prettyfast = new PrettyFast(link, referer);
        let playlist = await prettyfast.getPlaylist(parseInt(resolution));
        return {
            hash: 'id,language,resolution',
            mirrors: [ playlist ],
            subtitles: []
        };
    }

    async _getEpisodeHydraX(link, resolution) {
        let hydrax = new HydraX(link);
        let playlist = await hydrax.getPlaylist(parseInt(resolution));
        return {
            hash: 'id,language,resolution',
            mirrors: [ playlist ],
            subtitles: []
        };
    }

    /**
     * Same as in kissanime
     */
    _getEpisodeRapidVideo( link, resolution ) {
        let request = new Request( link, this.requestOptions );
        request.headers.set( 'x-cookie', 'q=' + resolution );
        request.headers.set( 'x-referer', this.url );
        return this.fetchDOM( request, 'video#videojs source' )
            .then( data => {
                if( !data.length ) {
                    throw new Error( `No matching video stream found for requested resolution "${resolution}"!` );
                }
                return Promise.resolve( { video: data[0].src, subtitles: [] } );
            } );
    }

    /**
     *
     */
    _getEpisodeOpenLoad( link/*, resolution*/ ) {
        let script = `
                new Promise( resolve => {
                    document.querySelector('div#videooverlay').click();
                    resolve( document.querySelector('video[id^="olvideo"]').src );
                } );
            `;
        let request = new Request( link, this.requestOptions );
        return Engine.Request.fetchUI( request, script )
            .then( stream => {
                return Promise.resolve( { video: stream, subtitles: [] } );
            } );
    }

    async _getEpisodeMyCloud(link, referer, resolution) {
        let mycloud = new MyCloud(link, referer, this.fetchRegex.bind(this));
        let result = await mycloud.getStreamAndPlaylist(parseInt(resolution));
        if(!resolution && result.stream) {
            return {
                video: result.stream,
                subtitles: []
            };
        }
        if(result.playlist) {
            return {
                hash: 'id,language,resolution',
                mirrors: [ result.playlist ],
                subtitles: []
            };
        }
        throw new Error('No stream/playlist found!');
    }

    async _getEpisodeVidstream(link, referer, resolution) {
        let vidstream = new Vidstream(link, referer, this.fetchRegex.bind(this));
        let result = await vidstream.getStreamAndPlaylist(parseInt(resolution));
        if(!resolution && result.stream) {
            return {
                video: result.stream,
                subtitles: []
            };
        }
        if(result.playlist) {
            return {
                hash: 'id,language,resolution',
                mirrors: [ result.playlist ],
                subtitles: []
            };
        }
        throw new Error('No stream/playlist found!');
    }

    async _getEpisodeMp4upload(link/*, resolution*/) {
        return {
            video: await new MP4Upload(link.replace(/\.html.+$/, '.html')).getStream(),
            subtitles: []
        };
    }

    /**
     *
     */
    _getEpisodeStreamango( link/*, resolution*/ ) {
        let script = `
            new Promise(resolve => {
                resolve(document.querySelector('video[id^="mgvideo"]').src);
            });
        `;
        let request = new Request( link, this.requestOptions );
        return Engine.Request.fetchUI( request, script )
            .then( stream => {
                return Promise.resolve( { video: stream, subtitles: [] } );
            } );
    }

    async _getEpisodeStreamtape(link/*, resolution*/) {
        return {
            video: await new Streamtape(link).getStream(),
            subtitles: []
        };
    }
}