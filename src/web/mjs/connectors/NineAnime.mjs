import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
import PrettyFast from '../videostreams/PrettyFast.mjs';
import Streamtape from '../videostreams/Streamtape.mjs';
import MyCloud from '../videostreams/MyCloud.mjs';
import Vidstream from '../videostreams/Vidstream.mjs';
import HydraX from '../videostreams/HydraX.mjs';

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
            }
        };
    }

    canHandleURI(uri) {
        return /https?:\/\/(w+\d*.)?9anime.to/.test(uri.origin);
    }

    async _initializeConnector() {
        /*
         * sometimes cloudflare bypass will fail, because chrome successfully loads the page from its cache
         * => append random search parameter to avoid caching
         */
        let uri = new URL(this.url);
        uri.searchParams.set('ts', Date.now());
        uri.searchParams.set('rd', Math.random());
        let request = new Request(uri.href, this.requestOptions);
        this.url = await Engine.Request.fetchUI(request, `window.location.origin`);
        console.log(`Assigned URL '${this.url}' to ${this.label}`);
    }

    async _checkCaptcha(request) {
        let response = await fetch(request);
        let body = await response.text();
        if(body.includes('/waf-verify')) {
            return new Promise((resolve, reject) => {
                let win = window.open(request.url);
                let timer = setInterval(() => {
                    if(win.closed) {
                        clearTimeout(timeout);
                        clearInterval(timer);
                        resolve();
                    } else {
                        //console.log('OPEN:', win.location.href);
                    }
                }, 750);
                let timeout = setTimeout(() => {
                    clearTimeout(timeout);
                    clearInterval(timer);
                    win.close();
                    reject(new Error('Captcha has not been solved within the given timeout!'));
                }, 120000);
            });
        } else {
            await this.wait(500);
            return Promise.resolve();
        }
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        await this._checkCaptcha(request);
        let response = await fetch(request);
        let data = await response.text();
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
                setTimeout(() => {
                    try {
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
                    } catch(error) {
                        reject(error);
                    }
                }, 2500);
            });
        `;
        let request = new Request(this.url + manga.id, this.requestOptions);
        await this._checkCaptcha(request);
        return Engine.Request.fetchUI(request, script);
    }

    async _getPages(chapter) {

        const referer = this.url + chapter.manga.id;
        let uri = new URL('/ajax/anime/episode?id=' + chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        const key = CryptoJS.enc.Utf8.parse(data.url.slice(0, 9));
        const encrypted = CryptoJS.enc.Base64.parse(data.url.slice(9));
        data = CryptoJS.RC4.decrypt({ ciphertext: encrypted }, key).toString(CryptoJS.enc.Utf8);
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
        let playlist = await mycloud.getPlaylist(parseInt(resolution));
        return {
            hash: 'id,language,resolution',
            mirrors: [ playlist ],
            subtitles: []
        };
    }

    async _getEpisodeVidstream(link, referer, resolution) {
        let vidstream = new Vidstream(link, referer, this.fetchRegex.bind(this));
        let playlist = await vidstream.getPlaylist(parseInt(resolution));
        return {
            hash: 'id,language,resolution',
            mirrors: [ playlist ],
            subtitles: []
        };
    }

    async _getEpisodeMp4upload(link/*, resolution*/) {
        let script = `
            new Promise(resolve => {
                resolve(document.querySelector('div#player video').src);
            });
        `;
        let request = new Request(link, this.requestOptions);
        let stream = await Engine.Request.fetchUI(request, script);
        return {
            video: stream,
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
        let streamtape = new Streamtape(link, this.fetchDOM.bind(this));
        let stream = await streamtape.getStream();
        return {
            video: stream,
            subtitles: []
        };
    }
}