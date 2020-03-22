import WordPressMadara from './templates/WordPressMadara.mjs';

export default class DoujinHentai extends WordPressMadara {

    constructor() {
        super();
        super.id = 'doujinhentai';
        super.label = 'DoujinHentai';
        this.tags = [ 'hentai', 'spanish' ];
        this.url = 'https://doujinhentai.net';

        this.queryPages = 'div#all source';
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(new URL('/lista-manga-hentai', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.page-content-listing ul.pagination li:nth-last-of-type(2) a');
        let pageCount = parseInt(data[0].text);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL('/lista-manga-hentai?page=' + page, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.panel-body > div > a.thumbnail');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.replace(/^\s*[Ll]eer/, '').replace(/[Oo]nline\s*$/, '').trim()
            };
        });
    }

    async _getChapters(manga) {
        let chapters = await super._getChapters(manga);
        chapters.forEach(chapter => chapter.title = chapter.title.replace(/^\s*[Ll]eer\s*([Cc]omic|[Dd]oujin|[Gg]aleria|[Mm]anga)\s*/, '').trim());
        return chapters;
    }
}