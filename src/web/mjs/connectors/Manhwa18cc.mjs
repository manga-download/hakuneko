import WordPressMadara from './templates/WordPressMadara.mjs';
import Manga from '../engine/Manga.mjs';
export default class Manhwa18cc extends WordPressMadara {
    constructor() {
        super();
        super.id = 'manhwa18cc';
        super.label = 'Manhwa 18 (.cc)';
        this.tags = [ 'webtoon', 'hentai', 'multi-lingual' ];
        this.url = 'https://manhwa18.cc';
        this.path ='/webtoons';
        this.queryMangas = 'div.manga-item div.thumb a';
        this.mangaNumberPerPage = 24;
        this.queryChapters ='div#chapterlist li a';
        this.queryPages = 'div.read-manga div.read-content source';
    }
    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.post-title > h1');
        const id = uri.pathname;
        const title = data[0].textContent.replace('18+', '').trim();
        return new Manga(this, id, title);
    }
    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
            run = mangaList[mangaList.length - 1] != mangas[mangas.length - 1].id;
        }
        return mangaList;
    }
    async _getMangasFromPage(page) {
        let request = new Request(new URL(this.path+'/'+page, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.title.trim()
            };
        });
    }
}
