import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaPill extends Connector {

    constructor() {
        super();
        super.id = 'mangapill';
        super.label = 'Mangapill';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://mangapill.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.container h1');
        return new Manga(this, uri.pathname, data[0].textContent.trim());
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
        let uri = new URL('/search?q=&type=&status=&genre=Action&genre=Adventure&genre=Cars&genre=Comedy&genre=Dementia&genre=Demons&genre=Doujinshi&genre=Drama&genre=Ecchi&genre=Fantasy&genre=Game&genre=Gender+Bender&genre=Harem&genre=Hentai&genre=Historical&genre=Horror&genre=Isekai&genre=Josei&genre=Kids&genre=Magic&genre=Martial+Arts&genre=Mecha&genre=Military&genre=Music&genre=Mystery&genre=Parody&genre=Police&genre=Psychological&genre=Romance&genre=Samurai&genre=School&genre=Sci-Fi&genre=Seinen&genre=Shoujo&genre=Shoujo+Ai&genre=Shounen&genre=Shounen+Ai&genre=Slice+of+Life&genre=Space&genre=Sports&genre=Super+Power&genre=Supernatural&genre=Thriller&genre=Vampire&genre=Yaoi&genre=Yuri', this.url);
        uri.searchParams.set('page', page);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.container a.mb-2');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#chapters div a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'source');
        return data.map(element => this.createConnectorURI(this.getAbsolutePath(element.dataset.src, request.url)));
    }
}
