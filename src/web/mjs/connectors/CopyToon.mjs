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

        this._initializeConnector();
    }

    async _initializeConnector() {
        let uri = new URL(this.url);
        uri.searchParams.set('ts', Date.now());
        uri.searchParams.set('rd', Math.random());
        let request = new Request(uri.href, this.requestOptions);
        await Engine.Request.fetchUI(request, '');
        let response = await fetch(request);
        this.url = new URL(response.url).origin;
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