import GnuBoard5BootstrapBasic2 from './templates/GnuBoard5BootstrapBasic2.mjs';

export default class CopyToon extends GnuBoard5BootstrapBasic2 {

    constructor() {
        super();
        super.id = 'copytoon';
        super.label = 'CopyToon';
        this.tags = [ 'webtoon', 'korean' ];
        this.url = 'https://copytoon88.com';

        this.path = [ '/웹툰', '/포토툰' ];
        this.scriptPages = `
            new Promise(resolve => {
                resolve([...document.querySelectorAll('div#bo_v_con img')].map(img => img.src));
            });
        `;
    }

    canHandleURI(uri) {
        return /https:\/\/copytoon\d+.com/.test(uri.origin);
    }

    async _initializeConnector() {
        /*
         * sometimes cloudflare bypass will fail, because chrome successfully loads the page from its cache
         * => append random search parameter to avoid caching
         */
        let uri = new URL(this.url);
        uri.searchParams.set('ts', Date.now());
        uri.searchParams.set('rd', Math.random());
        let request = new Request(uri.href, this.requestOptions);
        this.url = await Engine.Request.fetchUI(request, `window.location.origin`);
        console.log(`Assigned URL '${this.url}' to ${this.label}`);
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.contents-list ul li a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: [...element.querySelector('div.content-title').childNodes].pop().textContent.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }
}