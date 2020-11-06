import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class HentaiShark extends Connector {

    constructor() {
        super();
        super.id = 'hentaishark';
        super.label = 'Hentai Shark';
        this.tags = ['hentai', 'multi-lingual'];
        this.url = 'https://www.hentaishark.com/';
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(this.url, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.type-content li:nth-last-of-type(2) > a');
        let pageCount = parseInt(data[0].href.match(/(\d+)$/)[1]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL(`/manga-list?page=${page}`, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.item > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('div.caption').textContent.trim()
            };
        });
    }

    async _getMangas() {
        let msg = 'This website does not provide a manga list due to how long it would take, please copy and paste the URL containing the chapters directly from your browser into HakuNeko.';
    async _getMangaFromURI(uri) {
        let request = new Request(new URL(uri.href), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.col-sm-7 > h2');
        return new Manga(this, uri.pathname, data[0].textContent);
    }

    async _getChapters(manga) {
        return [ Object.assign({ language: '' }, manga) ];
    }

    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request,"a > source.lazy")
        return data.map(ele => ele.src.replace('thumb_',''))
    }
}