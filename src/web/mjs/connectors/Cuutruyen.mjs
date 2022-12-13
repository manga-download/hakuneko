import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Cuutruyen extends Connector {

    constructor() {
        super();
        super.id = 'cuutruyen';
        super.label = 'Cuutruyen';
        this.tags = [ 'manga', 'vietnamese' ];
        this.url = 'https://cuutruyen.net';
        this.api = 'https://kakarot.cuutruyen.net';
    }
    async _getMangaFromURI(uri) {
    	const mangaid = uri.href.match(/\/mangas\/([0-9]+)/)[1];
    	const req = new URL('/api/v1/mangas/'+mangaid, this.api);
        const request = new Request(req, this.requestOptions);
        const data = await this.fetchJSON(request);
        return new Manga(this, mangaid, data.data.attributes.name.trim());
    }
    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }
    async _getMangasFromPage(page) {
        const uri = new URL('/api/v1/mangas?page[size]=50&page[number]='+page, this.api);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.data.map(element => {
            return {
                id: element.id,
                title: element.attributes.name.trim()
            };
        });
    }
    async _getChapters(manga) {
        const uri = new URL('/api/v1/chapter_listings/'+manga.id, this.api);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        const chapters = JSON.parse(data.data.attributes.chapters);
        return chapters.map(element => {
            return {
                id: element.id,
                title: 'Chapter '+ element.number + ' '+ element.name.trim()
            };
        });
    }
    async _getPages(chapter) {
        const uri = new URL('/api/v1/readings/'+chapter.id, this.api);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        const pages = JSON.parse(data.data.attributes.pages);
        return pages.map(image => this.getAbsolutePath(image.imageUrl, request.url));
    }



}