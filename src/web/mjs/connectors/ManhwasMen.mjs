import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ManhwasMen extends Connector {

    constructor() {
        super();
        super.id = 'manhwasmen';
        super.label = 'Manhwas Men';
        this.tags = [ 'webtoon', 'hentai', 'korean', 'english' ];
        this.url = 'https://manhwas.men';
        this.path = '/manga-list';
        this.queryMangas = 'article.anime a';
        this.queryChapters = 'ul.episodes-list li a';
        this.queryPages = 'div#chapter_imgs source';

    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'h1.title');
        const id = uri.pathname;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let uri = new URL(`${this.path}?page=${page}`, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.querySelector('.title').textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.querySelector('p span').textContent.replace(manga.title, '').trim()
            };
        });
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);
        return data.filter(element => !element.src.includes('discord.jpg')).map(element => this.getRootRelativeOrAbsoluteLink(element, request.url));
    }
}
