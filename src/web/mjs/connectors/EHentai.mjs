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
            await this.wait(this.config.throttle.value);
            data = await this.fetchDOM(new Request(uri, this.requestOptions), 'div#gdt a');
            const pages = data.map(element => this.createConnectorURI(this.getAbsolutePath(element, uri.href)));
            pageLinks.push(...pages);
        }
        return pageLinks;
    }

    async _handleConnectorURI(payload) {
        const request = new Request(payload, this.requestOptions);

        //get full page body to avoid a request in case of failure
        await this.wait(this.config.throttle.value);
        const dom = (await this.fetchDOM(request, 'body'))[0];

        //First : try to get fullpicture url
        let data = dom.querySelector('a[href*="fullimg.php"]');
        let response = undefined;
        let piclink = undefined;

        if (!data) {
            //get fallback picture instead
            data = dom.querySelector('source#img');
            piclink = this.getAbsolutePath( data.src, request.url);
        } else piclink = this.getAbsolutePath( data.href, request.url);

        await this.wait(this.config.throttle.value);
        response = await fetch(piclink, this.requestOptions);

        //if login is required or we get the "Downloading original files of this gallery requires GP, and you do not have enough." message, use fallback picture
        if(response.url.match(/bounce_login.php/) || response.headers.get('content-type').includes('text/html')) {
            //console.log("bounced");
            await this.wait(this.config.throttle.value);
            data = dom.querySelector('source#img');
            response = await fetch(this.getAbsolutePath(data.src, request.url), this.requestOptions);
        }

        return {
            mimeType: response.headers.get('content-type'),
            data: new Uint8Array(await response.arrayBuffer())
        };
    }
}
