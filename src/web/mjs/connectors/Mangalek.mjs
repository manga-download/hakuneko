import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Mangalek extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangalek';
        super.label = 'مانجا ليك (Mangalek)';
        this.tags = [ 'manga', 'webtoon', 'arabic' ];
        this.url = 'https://mangalek.org';

        this.queryTitleForURI = 'div.profile-manga div.post-title h1';
        this.queryMangas = 'div.page-content-listing:not(#loop-content) div.post-title h3 a';
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let uri = new URL(`/manga/page/${page}/`, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }
}