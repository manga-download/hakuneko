import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaChan extends Connector {

    constructor() {
        super();
        super.id = 'mangachan';
        super.label = 'Манга-тян (Manga-chan)';
        this.tags = [ 'manga', 'russian' ];
        this.url = 'https://manga-chan.me';
        this.path = '/catalog';
        this.queryChapters = 'table.table_cha tr td div.manga2 a';
        this.queryPages = 'fullimg';

    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#info_wrap div.name_row h1 a.title_top_a');
        let id = this.getRootRelativeOrAbsoluteLink(data[0], this.url);
        let title = data[0].text.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const mangaList = [];
        const request = new Request(new URL(this.path, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div#pagination span a:last-of-type');
        const pageCount = parseInt(data[0].text.trim());
        for(let page = 0; page <= pageCount; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(this.path, this.url);
        uri.searchParams.set('offset', page * 20);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#content div.content_row div.manga_row1 h2 a.title_link', 3);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions );
        const data = await this.fetchDOM(request, this.queryChapters );
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.replace(manga.title, '').trim().replace('Читать онлайн', manga.title),
                language: 'ru'
            };
        });
    }

    async _getPages(chapter) {
        const script = `
            new Promise(resolve => resolve(${this.queryPages}));
        `;
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions );
        const data = await Engine.Request.fetchUI(request, script);
        return data.map(link => this.getAbsolutePath(link, request.url));
    }
}