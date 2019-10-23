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
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.gm div#gd2 h1#gn', 3);
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangaList(callback) {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the images directly from your browser into HakuNeko.';
        callback(new Error(msg), undefined);
    }

    async _getChapterList(manga, callback) {
        try {
            let chapterList = [ Object.assign({ language: '' }, manga) ];
            callback(null, chapterList);
        } catch(error) {
            console.error(error, manga);
            callback(error, undefined);
        }
    }

    async _getPageList(manga, chapter, callback) {
        try {
            let request = new Request(this.url + chapter.id, this.requestOptions);
            let data = await this.fetchDOM(request, 'div#gdt a');
            let pageList = data.map(element => this.createConnectorURI(this.getAbsolutePath(element, request.url)));
            callback(null, pageList);
        } catch(error) {
            console.error(error, chapter);
            callback(error, undefined);
        }
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload, this.requestOptions);
        let data = await this.fetchDOM(request, 'source#img, a[href*="fullimg.php"]');
        let response = await fetch(this.getAbsolutePath(data[1], request.url), this.requestOptions);
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