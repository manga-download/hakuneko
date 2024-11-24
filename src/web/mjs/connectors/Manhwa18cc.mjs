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

            //if mangalist is empty, fill it anyway
            if (mangaList.length == 0 && mangas.length > 0) {
                mangaList.push(...mangas);
                continue;
            }

            //if we have no more mangas, stop right here
            if (mangas.length == 0) {
                run == false;
                continue;
            }
            //now we have mangas, for sure, and mangalist not empty
            //we can check for existing mangas to stop the loop or not
            if (mangaList[mangaList.length - 1].id != mangas[mangas.length - 1].id) {
                mangaList.push(...mangas);
            } else run = false;

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
