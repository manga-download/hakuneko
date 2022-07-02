import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class ReadMNG extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'readmng';
        super.label = 'ReadMangaToday';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://www.readmng.com';
        this.requestOptions.headers.set( 'x-referer', this.url);

        this.queryMangas = '.mangaSliderCard a';
        this.querMangaTitleFromURI = 'div.titleArea > h2';
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/manga-list/' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('.postDetail h2').textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'a.chnumber');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.childNodes[0].textContent.trim(),
                language: ''
            };
        });
    }
}