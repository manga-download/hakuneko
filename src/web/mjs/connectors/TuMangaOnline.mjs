import Connector from '../engine/Connector.mjs';

export default class TuMangaOnline extends Connector {

    constructor() {
        super();
        super.id = 'tumangaonline';
        super.label = 'TuMangaOnline';
        this.tags = [ 'manga', 'spanish' ];
        this.url = 'https://tmofans.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _initializeConnector() {
        let domains = [
            this.url
            //'https://img1.tumangaonline.me'
        ];
        let promises = domains.map( domain => {
            /*
             * sometimes cloudflare bypass will fail, because chrome successfully loads the page from its cache
             * => append random search parameter to avoid caching
             */
            let uri = new URL( domain );
            uri.searchParams.set( 'ts', Date.now() );
            uri.searchParams.set( 'rd', Math.random() );
            let request = new Request( uri.href, this.requestOptions );
            return Engine.Request.fetchUI( request, '', 25000 );
        } );
        return Promise.all( promises );
    }

    async _getMangas() {
        let request = new Request('http://cdn.hakuneko.download/' + this.id + '/mangas.json', this.requestOptions);
        let response = await fetch(request);
        return await response.json();
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.chapters ul.list-group li.list-group-item.p-0');
        let chapterList = data.reduce((accumulator, element) => {
            let title = element.querySelector('h4 a[role="button"]').text;
            let chapters = [...element.querySelectorAll('ul.chapter-list li.list-group-item:not([style])')].map(element => {
                let id = element.querySelector('div.text-right button').getAttribute('onclick').match(/\(['"](\d+)['"]\)/)[1];
                let language = element.querySelector('i.flag-icon');
                let scanlator = element.querySelector('div.text-truncate a').text.trim();
                scanlator = scanlator ? ' [' + scanlator + ']' : '' ;
                return {
                    id: id, // this.getRelativeLink( id ).replace( /paginated\/?\d*$/, '/cascade' ),
                    title: title.replace(manga.title, '').trim() + scanlator,
                    language: language.className.match(/flag-icon-([a-z]+)/)[1]
                };
            } );
            return accumulator.concat( chapters );
        }, [] );
        return chapterList;
    }

    async _getPages(chapter) {
        let script = `
            new Promise(resolve => {
                let func = goToId.toString();
                let hash = func.match(/['"]:HASH['"]\\s*,\\s*['"]([^'"]+)['"]/)[1];
                let token = func.match(/['"]value['"]\\s*,\\s*['"]([^'"]+)['"]/)[1];
                let link = url_goto.replace(':GO_TO_ID', '${chapter.id}').replace(':HASH', hash);
                $.post(link, { _token: token }, data => {
                    resolve([...$(data).find('div#viewer-container div.viewer-image-container img.viewer-image')].map(img => img.src));
                });
            });
        `;
        let request = new Request(this.url + chapter.manga.id, this.requestOptions);
        let data = await Engine.Request.fetchUI(request, script);
        return data.map(img => this.createConnectorURI({
            url: this.getAbsolutePath(img, request.url),
            referer: request.url
        }));
    }

    _handleConnectorURI( payload ) {
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        this.requestOptions.headers.set( 'x-referer', payload.referer );
        let promise = super._handleConnectorURI( payload.url );
        this.requestOptions.headers.delete( 'x-referer' );
        return promise;
    }
}