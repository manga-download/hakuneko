import WordPressEManga from './templates/WordPressEManga.mjs';

// limited access for indonesian (and surounding) regions only
export default class BacaManga extends WordPressEManga {

    constructor() {
        super();
        super.id = 'bacamanga';
        super.label = 'BacaManga';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://bacamanga.co';
        this.path = '/manga/?list';

        this.queryMangas = 'div#content div.soralist ul li a.series';
        this.queryChapters = 'div.bxcl ul li span.lchx a';
    }

    async _initializeConnector() {
        /*
         * sometimes cloudflare bypass will fail, because chrome successfully loads the page from its cache
         * => append random search parameter to avoid caching
         */
        let uri = new URL(this.path, this.url);
        uri.searchParams.set('ts', Date.now());
        uri.searchParams.set('rd', Math.random());
        let request = new Request(uri, this.requestOptions);
        await Engine.Request.fetchUI(request, '', 25000);
    }

    _getPageList( manga, chapter, callback ) {
        let script = `
            new Promise(resolve => {
                //This script does no longer work when window is not shown ...
                /*
                [
                    'onwheel', 'keypress', 'contextmenu', 'scrollstart', 'mousemove', 'mousedown', 'keydown', 'touchstart'
                ].forEach(evt => document.dispatchEvent(new Event(evt)));
                setTimeout(() => {
                    resolve([...document.querySelectorAll('div.maincontent div#readerarea p img')].map(img => img.src));
                }, 2500);
                */
                resolve([...jQuery('img', jQuery.parseHTML(window[araarararararara.split('').reverse().join('')]))].map(img => img.src));
            });
        `;
        let request = new Request( this.url + chapter.id, this.requestOptions );
        Engine.Request.fetchUI( request, script )
            .then( data => {
                callback( null, data );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}