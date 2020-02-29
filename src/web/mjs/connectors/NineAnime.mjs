import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
import PrettyFast from '../videostreams/PrettyFast.mjs';
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
        let metaTitle = dom.querySelector('div.head h2[data-jtitle].title'); // 'meta[property="og:title"]'
        let id = this.getRootRelativeOrAbsoluteLink(metaURL, request.url);
        let title = metaTitle.dataset.jtitle.trim();
        return new Manga(this, id, title);
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        let request = new Request( mangaPageLinks[ index ], this.requestOptions );
        return this._checkCaptcha(request)
            .then(() => this.fetchDOM( request, 'div.film-list div.item div.inner a.name', 5 ))
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.text.trim()
                    };
                } );
                if( index < mangaPageLinks.length - 1 ) {
                    return this._getMangaListFromPages( mangaPageLinks, index + 1 )
                        .then( mangas => mangas.concat( mangaList ) );
                } else {
                    return Promise.resolve( mangaList );
                }
            } );
    }

    /**
     *
     */
    _getMangaList( callback ) {
        let request = new Request( this.url + '/filter?page=', this.requestOptions );
        this._checkCaptcha(request)
            .then(() => this.fetchDOM( request, 'div.paging-wrapper form span.total' ))
            .then( data => {
                let pageCount = parseInt( data[0].textContent.trim() );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => request.url + ( page + 1 ) );
                return this._getMangaListFromPages( pageLinks );
            } )
            .then( data => {
                callback( null, data );
            } )
            .catch( error => {
                console.error( error, this );
                callback( error, undefined );
            } );
    }

    /**
     *
     */
    _getChapterList( manga, callback ) {
        let script = `
            new Promise( resolve => {
                localStorage.setItem('player_autoplay', 0);
                setTimeout( () => {
                    let result = [...document.querySelectorAll( 'div#servers-container div.servers span.tabs span.tab' )]
                    .map( server => {
                        return {
                            name: server.dataset.name,
                            label: server.innerText.trim(),
                            episodes: [...document.querySelectorAll( 'div#servers-container div.servers div.server[data-name="' + server.dataset.name + '"] ul.episodes li a' )]
                            .map( episode => {
                                let uri = new URL( episode.href );
                                return {
                                    id: uri.pathname + uri.search, // episode.dataset.id,
                                    title: episode.innerText.trim() + ' [' + server.innerText.trim() + ']',
                                    language: ''
                                }
                            } )
                        }
                    } );
                    resolve( result );
                }, 1000 );
            } );
            `;
        let request = new Request( this.url + manga.id, this.requestOptions );
        this._checkCaptcha(request)
            .then(() => Engine.Request.fetchUI( request, script ))
            .then( data => {
                let episodeList = data.reduce( ( accumulator, server ) => accumulator.concat( server.episodes ), [] );
                callback( null, episodeList );
            } )
            .catch( error => {
                console.error( error, manga );
                callback( error, undefined );
            } );
    }

    async _getPages(chapter) {
        let script = `
            new Promise((resolve, reject) => {
                localStorage.setItem('player_autoplay', 0);
                document.querySelector('a[href*="' + window.location.pathname + '"]').click();
                setTimeout(() => {
                    try {
                        let uri = new URL($('#player iframe').attr('src'));
                        uri.searchParams.delete('autostart');
                        resolve(uri.href);
                    } catch(error) {
                        reject(error);
                    }
                }, 2500);
            });
        `;
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        await this._checkCaptcha(request);
        let data = await Engine.Request.fetchUI(request, script);
        await this.wait(500);
        switch(true) {
            case data.includes('prettyfast'):
                return this._getEpisodePrettyFast(data, new URL(chapter.id, this.url).href, this.config.resolution.value);
            case data.includes('hydrax'):
                return this._getEpisodeHydraX(data, this.config.resolution.value);
            case data.includes('rapidvid'):
                return this._getEpisodeRapidVideo(data, this.config.resolution.value);
            case data.includes('openload'):
                return this._getEpisodeOpenLoad(data, this.config.resolution.value);
            case data.includes('mcloud'):
                return this._getEpisodeMyCloud(data, this.config.resolution.value);
            case data.includes('mp4upload'):
                return this._getEpisodeMp4upload(data, this.config.resolution.value);
            case data.includes('streamango'):
                return this._getEpisodeStreamango(data, this.config.resolution.value);
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

    /**
     *
     */
    _getEpisodeMyCloud( link/*, resolution*/ ) {
        let request = new Request( link, this.requestOptions );
        request.headers.set( 'x-referer', this.url );
        return this.fetchRegex(request, /mediaSources\s*=\s*\[\s*\{\s*"file"\s*:\s*"(.*?)"/g)
            .then( data => {
                let playlist = data.pop();
                let request = new Request( playlist, this.requestOptions );
                request.headers.set( 'x-referer', link );
                return fetch( request )
                    .then( response => response.text() )
                    .then( streamlist => {
                        let stream = streamlist.match( /^.*?\d+\.m3u8$/gm )[0].trim();
                        // stream => hls/480/480.m3u8 || hls/720/720.m3u8 || ...
                        stream = playlist.replace( /[^/]+$/, stream );
                        return Promise.resolve( { hash: 'id,language,resolution', mirrors: [ stream ], subtitles: [] } );
                    } );
            } );
    }

    /**
     *
     */
    _getEpisodeMp4upload( link/*, resolution*/ ) {
        let script = `
                new Promise( resolve => {
                    resolve( document.querySelector('div#vid video#vid_html5_api').src );
                } );
            `;
        let request = new Request( link, this.requestOptions );
        return Engine.Request.fetchUI( request, script )
            .then( stream => {
                return Promise.resolve( { video: stream, subtitles: [] } );
            } );
    }

    /**
     *
     */
    _getEpisodeStreamango( link/*, resolution*/ ) {
        let script = `
                new Promise( resolve => {
                    resolve( document.querySelector('video[id^="mgvideo"]').src );
                } );
            `;
        let request = new Request( link, this.requestOptions );
        return Engine.Request.fetchUI( request, script )
            .then( stream => {
                return Promise.resolve( { video: stream, subtitles: [] } );
            } );
    }
}