import WordPressEManga from './templates/WordPressEManga.mjs';

/**
 *
 */
export default class BacaManga extends WordPressEManga {

    /**
     * limited access for indonesian (and surounding) regions only
     */
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

    /**
     *
     */
    _getPageList( manga, chapter, callback ) {
        let script = `
            new Promise(resolve => {
                // "tratshcuot nwodyek nwodesuom evomesuom tratsllorcs unemtxetnoc sserpyek leehwno".split("").reverse().join("")
                [
                    'onwheel', 'keypress', 'contextmenu', 'scrollstart', 'mousemove', 'mousedown', 'keydown', 'touchstart'
                ].forEach(evt => document.dispatchEvent(new Event(evt)));
                setTimeout(() => {
                    resolve([...document.querySelectorAll('div.maincontent div#readerarea p img')].map(img => img.src));
                }, 2500);
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