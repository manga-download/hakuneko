import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class OlympusScanlation extends Connector {

    constructor() {
        super();
        super.id = 'olympusscanlation';
        super.label = 'Olympus Scanlation';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://olympusbiblioteca.com';
        this.apiUrl = 'https://dashboard.olympusbiblioteca.com';
    }

    async _getMangaFromURI(uri) {
        const jsonObject= await this.getNuxt(uri);
        const objkey = new URL(uri).pathname;
        const slug = jsonObject.data[objkey].data.slug;
        const mangatype = jsonObject.data[objkey].data.type;
        const title = jsonObject.data[objkey].data.name.trim();
        const id = JSON.stringify({ slug: slug, type : mangatype});
        return new Manga(this, id, title);
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
        const uri = new URL(`/api/series?page=${page}&direction=asc&type=comic`, this.apiUrl);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.data.series.data.map(element => {
            return {
                id: JSON.stringify( { slug : element.slug, type : element.type} ),
                title: element.name.trim()
            };
        });
    }

    async _getChapters(manga) {
        let chapterList = [];
        for (let page = 1, run = true; run; page++) {
            const chapters = await this._getChaptersFromPage(manga, page);
            chapters.length > 0 ? chapterList.push(...chapters) : run = false;
        }
        return chapterList;
    }

    async _getChaptersFromPage(manga, page) {
        const mangaData = JSON.parse(manga.id);
        const uri = new URL(`/api/series/${mangaData.slug}/chapters?page=${page}&direction=desc&type=${mangaData.type}`, this.apiUrl);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.data.map(element => {
            return {
                id: element.id,
                title: element.name.trim()
            };
        });
    }

    async _getPages(chapter) {
        const mangaData = JSON.parse(chapter.manga.id);
        const uri = new URL(`/api/series/${mangaData.slug}/chapters/${chapter.id}?type=${mangaData.type}`, this.apiUrl);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.chapter.pages;
    }

    async getNuxt(uri) {
        const request = new Request(uri, this.requestOptions);
        const script = `
            new Promise(resolve => {
                resolve(__NUXT__);
            });
            `;
        return await Engine.Request.fetchUI(request, script);
    }

}
