import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Ganma extends Connector {

    constructor() {
        super();
        super.id = 'ganma';
        super.label = 'GANMA!';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://ganma.jp';
        this.requestOptions.headers.set('x-from', this.url);
    }

    async _getMangaFromURI(uri) {
        let request = new Request(this.url + '/api/1.0/magazines/web/' + uri.pathname.split('/').pop(), this.requestOptions);
        let data = await this.fetchJSON(request);
        let id = data.root.id;
        let title = data.root.title.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        return [
            ...await this._getMangasTop(),
            ...await this._getMangasCompleted()
        ];
    }

    async _getMangasTop() {
        const uri = new URL('/api/2.2/top', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.root.boxes.reduce((accumulator, box) => {
            let mangas = box.panels.map(panel => {
                return {
                    id: panel.id,
                    title: panel.title.trim()
                };
            });
            return accumulator.concat(mangas);
        }, []);
    }

    async _getMangasCompleted() {
        const uri = new URL('/api/1.1/ranking?flag=Finish', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.root.map(manga => {
            return {
                id: manga.id,
                title: manga.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL('/api/1.0/magazines/web/' + manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.root.items
            .map((chapter, index) => {
                return {
                    id: chapter.id,
                    title: ((chapter.number || index + 1) + ': 【' + chapter.title + '】 ' + chapter.subtitle).trim()
                };
            });
    }

    async _getPages(chapter) {
        const uri = new URL('/api/1.0/magazines/web/' + chapter.manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        data = data.root.items.find(item => item.id === chapter.id ).page;
        return data.files.map(image => this.getAbsolutePath(image + '?' + data.token, data.baseUrl));
    }
}