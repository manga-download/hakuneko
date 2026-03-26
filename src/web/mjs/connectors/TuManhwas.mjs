import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class TuManhwas extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'tumanhwas';
        super.label = 'TuManhwas';
        this.tags = [ 'manga', 'webtoon', 'spanish' ];
        this.url = 'https://tumanhwas.com';
        this.path = '/biblioteca';
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL(this.path, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.pagination li:nth-last-child(2) a');
        const pageCount = parseInt(data[0].href.match(/(\d+)$/)[1]);
        for(let page = 1; page <= pageCount; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/biblioteca?page=' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '.bs .bsx .tt');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }
}