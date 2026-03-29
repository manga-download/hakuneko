import SpeedBinb from './SpeedBinb.mjs';
import Manga from '../../engine/Manga.mjs';

export default class TakeShoboNew extends SpeedBinb {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;
        this.path = '/manga/';

        this.queryMangaTitle = 'ul.manga__title li:first-child';
        this.queryMangas = 'div.manga_item';
        this.queryMangasTitle = 'p.manga_title';
        this.queryMangasLink = 'a';
        this.queryChapters = 'div.read__area div.read__outer';
        this.queryChaptersTitle = 'li.episode';
        this.queryChaptersLink = 'a.read__link';
        this.queryChaptersReadable = 'div.episode__read';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(new URL(uri), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangaTitle);
        return new Manga(this, uri.pathname, data[0].textContent.trim());
    }

    async _getMangas() {
        const uri = new URL(this.path, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            let title = element.querySelector(this.queryMangasTitle).textContent;
            let id = this.getRootRelativeOrAbsoluteLink(element.querySelector(this.queryMangasLink), this.url);
            return {
                id: id,
                title: title.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.filter(element => {
            let readable = element.querySelector(this.queryChaptersReadable);
            return readable && readable.textContent == "読む";
        }).map(element => {
            // NOTE: In some cases the chapter is redirected to an URL correctly ending with a '/'
            //       When using the URL without the ending '/', the SpeedBin template may produce a wrong base URL,
            //       which will lead to 404 errors when acquiring the images
            let title = element.querySelector(this.queryChaptersTitle).innerText.replace(manga.title, '').trim();
            let id = this.getRootRelativeOrAbsoluteLink(element.querySelector(this.queryChaptersLink), request.url);
            id += id.endsWith('/') ? '' : '/';
            return {
                id: id,
                title: title,
                language: ''
            };
        });
    }
}
