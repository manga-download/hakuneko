import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class EHentai extends Connector {

    constructor() {
        super();
        super.id = 'ehentai';
        super.label = 'E-Hentai';
        this.tags = ['hentai', 'multi-lingual'];
        this.url = 'https://e-hentai.org';
        this.links = {
            login: 'https://forums.e-hentai.org/index.php?act=Login&CODE=00'
        };
        this.requestOptions.headers.set('x-cookie', 'nw=1');

        this.config = {
            throttle: {
                label: 'Throttle Requests [ms]',
                description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests.\nThe website may block images for to many consecuitive requests.',
                input: 'numeric',
                min: 250,
                max: 1000,
                value: 500
            }
        };
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.gm div#gd2 h1#gn', 3);
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the images directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        return [ Object.assign({ language: '' }, manga) ];
    }

    async _getPages(chapter) {
        const pageLinks = [];
        const uri = new URL(chapter.id, this.url);
        let data = await this.fetchDOM(new Request(uri, this.requestOptions), 'div.gtb table.ptt td:nth-last-of-type(2) a');
        const pageCount = parseInt(data.pop().text.trim());
        for(let page = 0; page < pageCount; page++) {
            uri.searchParams.set('p', page);
            data = await this.fetchDOM(new Request(uri, this.requestOptions), 'div#gdt a');
            const pages = data.map(element => this.createConnectorURI(this.getAbsolutePath(element, uri.href)));
            pageLinks.push(...pages);
        }
        return pageLinks;
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload, this.requestOptions);
        let data = await this.fetchDOM(request, 'source#img, a[href*="fullimg.php"]');
        let response = await fetch(this.getAbsolutePath(data[0], request.url), this.requestOptions);
        if(!response.headers.get('content-type').startsWith('image/')) {
            response = await fetch(this.getAbsolutePath(data[0], request.url), this.requestOptions);
            //console.log('Download Optimized:', response.url);
        } else {
            //console.log('Download Original:', response.url);
        }
        return {
            mimeType: response.headers.get('content-type'),
            data: new Uint8Array(await response.arrayBuffer())
        };
    }
}