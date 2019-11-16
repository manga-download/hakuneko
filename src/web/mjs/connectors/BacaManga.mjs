import WordPressEManga from './templates/WordPressEManga.mjs';

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

    async _getPages(chapter) {
        // limited access for indonesian (and surounding) regions only (at least for image CDNs)
        let script = `
            new Promise(resolve => {
                if(window['araarararararara']) {
                    return resolve([...jQuery('img', jQuery.parseHTML(window[araarararararara.split('').reverse().join('')]))].map(img => img.src));
                }
                if(window['nyeh']) {
                    /*
                    jQuery(document).find('body').bind('onwheel keypress contextmenu scrollstart mousemove mousedown keydown touchstart', function(evt) {
                        nyeh();
                        nyeh = function() {};
                    });
                    */
                    nyeh();
                    return resolve([...document.querySelectorAll('div.maincontent div#readerarea p img')].map(img => img.src));
                }
                throw new Error('Failed to extract image links!');
            });
        `;
        let request = new Request( this.url + chapter.id, this.requestOptions );
        return await Engine.Request.fetchUI(request, script);
    }
}