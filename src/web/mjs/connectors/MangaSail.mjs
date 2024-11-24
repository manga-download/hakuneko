import Connector from '../engine/Connector.mjs';

export default class MangaSail extends Connector {

    constructor() {
        super();
        super.id = 'mangasail';
        super.label = 'MangaSail';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://sailmg.com';

        this.config = {
            username: {
                label: 'Username',
                description: 'Username for login with your account.\nVarious chapters will only be accessable after login.',
                input: 'text',
                value: ''
            },
            password: {
                label: 'Password',
                description: 'Password for login with your account.\nVarious chapters will only be accessable after login.',
                input: 'password',
                value: ''
            }
        };

        // TODO: change behavior to login on demand (if not logged-in and credentials exist, try login), instead of event listener login
        Engine.Settings.addEventListener('loaded', this._onSettingsChanged.bind(this));
        Engine.Settings.addEventListener('saved', this._onSettingsChanged.bind(this));
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL('/directory', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.pagination li.pager-last a');
        const pageCount = parseInt(data[0].href.match(/([\d]+)$/)[1]);
        for(let page = 0; page <= pageCount; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/directory?page=' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'table.directory_list tr td:first-of-type a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {

        let chapterList = [];
        const uri = new URL (manga.id, this.url );
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.pagination li.pager-last a');
        const pageCount = data.length > 0 ? parseInt(data[0].href.match(/([\d]+)$/)[1]) : 0;
        for(let page = 0; page <= pageCount; page++) {
            const chapters = await this._getChaptersFromPage(manga, page);
            chapterList.push(...chapters);
        }
        return chapterList;
    }

    async _getChaptersFromPage(manga, page) {
        const uri = new URL (manga.id+'?page='+page, this.url );
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'table.chlist tr td:first-of-type a');
        return data.map( element => {
            //escape all special characters used in Javascript regexes (improved from flatmanga : use incensitive case)
            const bloatRegex = new RegExp(manga.title.replace(/[*^.|$?+\-()[\]{}\\/]/g, '\\$&'), 'i');
            const title = element.text.replace(bloatRegex, '').trim();

            return {
                id: this.getRelativeLink( element ),
                title: title,
                language: 'en'
            };
        });

    }

    async _getPages(chapter) {
        let script = `
            new Promise(resolve => resolve(Drupal.settings.showmanga.paths));
        `;
        let uri = new URL(chapter.id, this.url);
        uri.searchParams.set('page', 'all');
        let request = new Request(uri, this.requestOptions);
        const data = await Engine.Request.fetchUI(request, script);
        return data.filter(page => !page.includes('script'))
            .map(page => this.createConnectorURI({url : page, referer : uri}));

    }

    async _handleConnectorURI(payload) {
        const request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', payload.referer);
        const response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }

    /**
     *
     */
    _onSettingsChanged() {
        let user = this.config.username.value;
        let pass = this.config.password.value;
        let credentials = user + pass;
        if(this._credentials !== credentials && user && pass) {
            this._credentials = credentials;
            fetch( this.url + '/user/logout', this.requestOptions )
                .then( () => this.fetchDOM( this.url + '/user/login', 'form#user-login input' ) )
                .then( data => {
                    if( !data || data.length < 3 ) {
                        throw new Error( `Failed to get ${this.label} login form, this may happen when already logged in!` );
                    }
                    let form = new URLSearchParams();
                    data.forEach( input => {
                        form.append( input.name, input.value );
                    } );
                    form.set( 'name', user );
                    form.set( 'pass', pass );
                    return Promise.resolve( form );
                } )
                .then( form => {
                    this._setLoginRequestOptions( form );
                    // NOTE: on success the session cookie will be set for all future requests
                    let promise = fetch( this.url + '/system/ajax', this.requestOptions );
                    this._clearRequestOptions();
                    return promise;
                } )
                .then( response => response.json() )
                .then( data => {
                    let success =
                        data.length === 3
                        && data[0]['command'] === 'settings'
                        && data[1]['command'] === 'modal_display'
                        && data[2]['command'] === 'reload';
                    return success ? Promise.resolve() : Promise.reject(new Error('Invalid login credentials!'));
                } )
                .catch( error => console.warn( 'Login failed', this.label, error ) );
        }
    }

    /**
     *
     */
    _setLoginRequestOptions( form ) {
        this.requestOptions.method = 'POST';
        this.requestOptions.headers.set( 'content-type', 'application/x-www-form-urlencoded' );
        this.requestOptions.body = form;
    }

    /**
     *
     */
    _clearRequestOptions() {
        delete this.requestOptions.body;
        this.requestOptions.headers.delete( 'content-type' );
        this.requestOptions.method = 'GET';
    }
}
