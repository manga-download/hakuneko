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
        let pageLinks = [];
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.gtb table.ptt td:not(:first-child):not(:last-child) a');
        for(let element of data) {
            let uri = this.getAbsolutePath(element, request.url);
            data = await this.fetchDOM(new Request(uri, this.requestOptions), 'div#gdt a');
            let pages = data.map(element => this.createConnectorURI(this.getAbsolutePath(element, request.url)));
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