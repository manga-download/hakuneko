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

        this._initializeURL();
    }

    async _initializeURL() {
        let response = await fetch(this.url);
        this.url = new URL(response.url).origin;
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