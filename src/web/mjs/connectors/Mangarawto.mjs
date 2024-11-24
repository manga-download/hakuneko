import Manga9 from './Manga9.mjs';

export default class Mangarawto extends Manga9 {

    constructor() {
        super();
        super.id = 'mangarawto';
        super.label = 'Manga Raw (mangaraw.to)';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://mangaraw.to';
    }

    canHandleURI(uri) {
        return /^mangaraw\.(to|vip|io)$/.test(uri.hostname);
    }

    async _getPages(chapter) {
        const script = `
            new Promise(resolve => {
                let pagelist = [...document.querySelectorAll('div.card-wrap img')].map(element => {
                    return new URL(element.dataset.src, window.location).href
                });
                resolve(pagelist);
            });
        `;
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await Engine.Request.fetchUI(request, script);
        return data.map(image => this.createConnectorURI(image));

    }

}
