import GnuBoard5BootstrapBasic2 from './templates/GnuBoard5BootstrapBasic2.mjs';

export default class ToonSarang extends GnuBoard5BootstrapBasic2 {

    constructor() {
        super();
        super.id = 'toonsarang';
        super.label = 'ToonSarang';
        this.tags = [ 'webtoon', 'korean' ];
        this.url = 'https://toonsarang.lol';

        this.path = [ '/웹툰', '/포토툰' ];
        this.scriptPages = `
            new Promise(resolve => {
                resolve([...document.querySelectorAll('div#bo_v_con img')].map(img => img.src));
            });
        `;
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.contents-list ul li a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: [...element.querySelector('div.content-title').childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).find(t => t.length > 0).replace(manga.title, '').trim(),
                language: ''
            };
        });
    }
}