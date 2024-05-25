import FlatManga from './templates/FlatManga.mjs';

export default class KissAway extends FlatManga {

    constructor() {
        super();
        super.id = 'kissaway';
        super.label = 'KLManga';
        this.tags = [ 'manga', 'raw', 'japanese' ];
        this.url = 'https://klz9.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _getChapters(manga) {
        const script = `
            new Promise(async resolve => {
                const nodes = document.querySelectorAll("div#list-chapter a")
                const chapters = Array.prototype.map.call(nodes, item => {
                    return {
                        id : item.href,
                        title : item.title
                    }
                });
                resolve(chapters);
            });
        `;

        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        return await Engine.Request.fetchUI(request, script);
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const script = `
            new Promise(async resolve => {
            	const pages = document.querySelectorAll("div#list-imga img.chapter-img");
                resolve(Array.prototype.map.call(pages, item => item.src));
            });
        `;
        const request = new Request(uri, this.requestOptions);
        const data = await Engine.Request.fetchUI(request, script);
        return data.map(link => this.createConnectorURI(link));
    }

}
