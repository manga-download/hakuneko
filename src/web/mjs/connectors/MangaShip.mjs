import Connector from '../engine/Connector.mjs';

export default class MangaShip extends Connector {

    constructor() {
        super();
        super.id = 'mangaship';
        super.label = 'Manga Ship';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://www.mangaship.com';
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
        let uri = new URL('/Tr/Mangalar', this.url);
        uri.searchParams.set('page', page);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.mangaList div.movie-item-title a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri , this.requestOptions);
        let data = await this.fetchDOM(request, 'div.plylist-single-content > a:first-of-type');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.title.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id.replace('/Oku/', '/MangaOku/'), this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.reading-content source');
        return data.map(element => {
            if(element.src.startsWith('data:')) {
                const data = element.src.split(',')[1];
                return this._mapDataUriType(data) + data;
            } else {
                return this.getAbsolutePath(element, request.url);
            }
        });
    }

    _mapDataUriType(signature) {
        if(signature.startsWith('/9j/4AA')) {
            return 'data:image/jpeg;base64,';
        }
        if(signature.startsWith('iVBORw0')) {
            return 'data:image/png;base64,';
        }
        return 'data:application/octet-stream;base64,';
    }
}