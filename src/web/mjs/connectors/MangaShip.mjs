import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaShip extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangaship';
        super.label = 'Manga Ship';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://www.mangaship.com';
    }

    // overwrite wp-madara implementation with default implementation ...
    async _getMangaList(callback) {
        try {
            callback(null, await this._getMangas());
        } catch(error) {
            console.error(error, this);
            callback(error, undefined);
        }
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
        let uri = new URL('/Tr/Search', this.url);
        uri.searchParams.set('tur', 'Manga');
        uri.searchParams.set('page', page);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.title.trim()
            };
        });
    }

    // overwrite wp-madara implementation with default implementation ...
    async _getPageList(manga, chapter, callback) {
        try {
            callback(null, await this._getPages(chapter));
        } catch(error) {
            console.error(error, chapter);
            callback(error, undefined);
        }
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id.replace('/Oku/', '/MangaOkuListe/'), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.reading-content source');
        return data
            .map(element => this.getAbsolutePath(element, request.url))
            .filter(link => !link.endsWith('999.jpg'));
    }
}