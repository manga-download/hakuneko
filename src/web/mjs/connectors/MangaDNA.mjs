import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaDNA extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangadna';
        super.label = 'MangaDNA';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://mangadna.com';

        this.queryMangas = 'div.hcontent h3.htitle a';
        this.queryChapters = 'ul.row-content-chapter li.a-h a.chapter-name';
        this.queryPages = 'div.read-content source';
        this.queryTitleForURI = 'div.post-title h1';
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _getMangas() {
        let mangaList = [];
        var previousMangas = [{ id: 'placeholder' }];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 && mangas[0].id != previousMangas[0].id ? mangaList.push(...mangas) : run = false;
            previousMangas = mangas;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/manga/page/' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.textContent.trim()
            };
        });
    }
}