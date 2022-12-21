import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
export default class MangaEsp extends Connector {
    constructor() {
        super();
        super.id = 'mangaesp';
        super.label = 'MangaEsp';
        this.tags = [ 'manga', 'spanish', 'webtoon' ];
        this.url = 'https://mangaesp.co';
    }
    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        let id = uri.split('/');
        id = id[id.length-1];
        const data = await this.fetchDOM(request, 'div.titulo h1');
        return new Manga(this, id, data[0].textContent.trim());
    }
    async _getMangas() {
        const uri = new URL('/comic', this.url);
        const request = new Request(uri, this.requestOptions);
        const script = `
        new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    resolve(projectos);
                }
                catch(error) {
                    reject(error);
                }
            },
            2500);
        });
        `;
        const data = await Engine.Request.fetchUI(request, script, 10000, true);
        return data.map(element => {
            return {
                id: element.slug,
                title: element.value.trim()
            };
        });
    }
    async _getChapters(manga) {
        const uri = new URL('/ver/'+manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.grid-principal div.grid-secundario a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('p:not([class]').textContent.trim()
            };
        });
    }
    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'source.img-fluid');
        return data.map(image => this.getAbsolutePath(image, request.url));
    }
}