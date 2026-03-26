import FlatManga from './templates/FlatManga.mjs';

export default class Manga33 extends FlatManga {

    constructor() {
        super();
        super.id = 'manga33';
        super.label = 'Manga33';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://www.manga33.com';
        this.path = '/list/lastdotime-0.html';
        this.requestOptions.headers.set('x-referer', this.url);

        this.queryMangaTitle = 'head meta[name="description"]';
        this.queryMangas = 'div.media div.media-body h3.media-heading a';
        this.queryPages = 'div.chapter-content source';
        this.language = 'en';
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL(this.path, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.pagination li:last-of-type a');
        const pageCount = parseInt(data[0].href.match(/(\d+)\.html$/)[1]);
        for(let page = 0; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(`/list/lastdotime-${page}.html`, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        const chapters = await super._getChapters(manga);
        chapters.forEach(chapter => chapter.id = chapter.id.replace(/-\d+.html$/, '-all.html'));
        return chapters;
    }
}