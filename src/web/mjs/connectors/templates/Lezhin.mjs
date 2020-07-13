import Connector from '../../engine/Connector.mjs';

export default class Lezhin extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;
        this.apiURL = 'https://www.lezhin.com/api/v2'; // https://api.lezhin.com/v2
        this.cdnURL = 'https://cdn.lezhin.com';
        this.userID = undefined;
        this.accessToken = '995dba2e-8c5d-4249-b601-38c5d3e092e5';
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = {
            username: {
                label: 'E-Mail',
                description: 'E-Mail for login with your Lezhin account.\nAn account is required to access R-rated content.',
                input: 'text',
                value: ''
            },
            password: {
                label: 'Password',
                description: 'Password for login with your Lezhin account.\nAn account is required to access R-rated content.',
                input: 'password',
                value: ''
            }
        };
    }

    async _initializeAccount() {
        if(this.userID || !this.config.username.value || !this.config.password.value) {
            return;
        }
        let script = `
            new Promise((resolve, reject) => {
                let form = $('form#login-form');
                form.find('input#login-email').val('${this.config.username.value}');
                form.find('input#login-password').val('${this.config.password.value}');
                $.ajax({
                    type: 'POST',
                    url: form.prop('action'),
                    data: form.serialize(),
                    success: resolve,
                    error: reject
                });
            });
        `;
        let request = new Request(new URL(this.url + '/login'), this.requestOptions);
        await Engine.Request.fetchUI(request, script);
        let response = await fetch(new Request(new URL(this.url + '/account'), this.requestOptions));
        let data = await response.text();
        let cdn = data.match(/cdnUrl\s*:\s*['"]([^'"]+)['"]/);
        let user = data.match(/userId\s*:\s*['"](\d+)['"]/);
        let token = data.match(/token\s*:\s*['"]([^'"]+)['"]/);
        this.cdnURL = cdn ? cdn[1] : this.cdnURL;
        this.userID = user ? user[1] : undefined;
        this.accessToken = token ? token[1] : this.accessToken;
        if(this.userID) {
            await fetch(this.url + '/adultkind?path=&sw=all', this.requestOptions);
        }
        // force user locale user setting to be the same as locale from the currently used website ...
        // => prevent a warning webpage that would appear otherwise when loading chapters / pages
        return fetch(this.url + '/locale/' + this.locale, this.requestOptions);
    }

    /**
     *
     */
    _getMangaFromPage( offset, limit ) {
        offset = offset || 0;
        limit = limit || 500;
        let uri = new URL( this.apiURL + '/comics' );
        uri.searchParams.set( 'offset', offset );
        uri.searchParams.set( 'limit', limit );
        uri.searchParams.set( 'country_code', '' );
        uri.searchParams.set( 'store', 'web' );
        uri.searchParams.set( 'adult_kind', 'all' );
        uri.searchParams.set( 'filter', 'all' );
        //uri.searchParams.set( '_', Date.now() );
        return fetch( uri.href, this.requestOptions )
            .then( response => response.json() )
            .then( data => {
                if( data.code ) {
                    throw new Error( data.description );
                }
                let mangaList = data.data.map( manga => {
                    return {
                        id: manga.alias, // manga.id
                        title: manga.title
                    };
                } );
                if( data.hasNext ) {
                    return this._getMangaFromPage( offset + limit, limit )
                        .then( mangas => mangaList.concat( mangas ) );
                } else {
                    return Promise.resolve( mangaList );
                }
            } );
    }

    /**
     *
     */
    _getMangaList( callback ) {
        this._getMangaFromPage()
            .then( data => {
                callback( null, data );
            } )
            .catch( error => {
                console.error( error, this );
                callback( error, undefined );
            } );
    }

    async _getChapters(manga) {
        await this._initializeAccount();
        /*
         *let purchased = [];
         *let subscription = false;
         *if(this.accessToken) {
         *    let uri = new URL(`${this.apiURL}/users/${this.userID}/contents/${mangaiD}`);
         *    let request = new Request(uri, this.requestOptions);
         *    request.headers.set('authorization', 'Bearer ' + this.accessToken);
         *    let data = await this.fetchJSON(request);
         *    purchased = data.data.purchased;
         *    subscription = data.data.subscribed;
         *}
         */
        let script = `
            new Promise((resolve, reject) => {
                // wait until episodes have been updated with purchase info ...
                setTimeout(() => {
                    try {
                        let chapters = __LZ_PRODUCT__.all // __LZ_PRODUCT__.product.episodes
                        .filter(chapter => {
                            if(chapter.purchased) {
                                return true;
                            }
                            if(chapter.coin === 0) {
                                return true;
                            }
                            if(chapter.freedAt && chapter.freedAt < Date.now()) {
                                return true;
                            }
                            if(chapter.prefree && chapter.prefree.closeTimer && chapter.prefree.closeTimer.expiredAt > Date.now()) {
                                return true;
                            }
                            return false;
                        })
                        .map(chapter => {
                            return {
                                id: chapter.name, // chapter.id,
                                title: chapter.display.displayName + ' - ' + chapter.display.title,
                                language: '${this.locale}'
                            };
                        });
                        resolve(chapters);
                    } catch(error) {
                        reject(error);
                    }
                }, 2500);
            });
        `;
        let request = new Request(new URL('/comic/' + manga.id, this.url), this.requestOptions);
        return Engine.Request.fetchUI(request, script);
    }

    async _getPages(chapter) {
        await this._initializeAccount();
        let uri = new URL(this.apiURL + '/inventory_groups/comic_viewer');
        uri.searchParams.set('type', 'comic_episode');
        uri.searchParams.set('alias', chapter.manga.id);
        uri.searchParams.set('name', chapter.id);
        /*
         *uri.searchParams.set('platform', 'web');
         *uri.searchParams.set('store', 'web');
         */
        let data = await this.fetchJSON(uri.href, this.requestOptions);
        let comicID = data.data.extra.comic.id;
        let episodeID = data.data.extra.episode.id;
        /*
         *let top = data.data.extra.episode.topInfo !== undefined;
         *let bottom = data.data.extra.episode.bottomInfo !== undefined;
         *let pageType = data.data.extra.episode.display.type; // 'g'
         */
        let pages = 0;
        let path = '';
        if(data.data.extra.episode.scroll) {
            pages = data.data.extra.episode.scroll;
            path = 'scroll';
        }
        return [... new Array(pages).keys()].map(page => {
            let uri = new URL([this.cdnURL, 'v2/comics', comicID, 'episodes', episodeID, 'contents', path + 's', page + 1].join('/'));
            uri.searchParams.set('access_token', this.accessToken);
            /*
             * q  | Free  | Purchased
             * ----------------------
             * 10 |  480w |  640w
             * 20 |  640w |  720w
             * 30 |  720w | 1080w
             * 40 | 1080w | 1280w
             */
            uri.searchParams.set('q', 40);
            //uri.searchParams.set( 'updated', 1539846001617 /* Date.now() */ );
            return uri.href;
        });
    }
}