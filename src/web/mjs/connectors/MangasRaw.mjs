import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MangasRaw extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangasraw';
        super.label = 'MangasRaw';
        this.tags = [ 'manga', 'japanese', 'raw' ];
        this.url = 'https://mangas-raw.com';
        this.path = '/manga/list-mode/';
    }

    async _getMangas() {
        let mangaList = [];
        for (let path = '/manga', mangas = []; path !== null;) {
            ({ path, mangas } = await this._getMangasFromPage(path));
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(path) {
        const uri = new URL(path, this.url);
        const request = new Request(uri, this.requestOptions);
        const content = await this.fetchDOM(request, 'div#content');
        const data = [...content[0].querySelectorAll('div.listupd div.bs div.bsx > a')];
        const next = content[0].querySelector('ul.pagination a.next.page-numbers');
        return {
            path: next ? next.pathname + next.search : null,
            mangas: data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                    title: element.title.trim()
                };
            })
        };
    }
}