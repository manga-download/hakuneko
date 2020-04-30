import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaJar extends Connector {

    constructor() {
        super();
        super.id = 'mangajar';
        super.label = 'MangaJar';
        this.tags = [ 'manga', 'english', 'scanlation' , 'webtoon' ];
        this.url = 'https://mangajar.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'span.post-name');
        let id = uri.pathname.split('manga/')[1];
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage( page ) {
        let request = new Request(new URL(`/manga?page=${page}`, this.url));
        let data = await this.fetchDOM(request, 'div.row article.flex-item div.post-description a.card-about');
        return data.map(element => {
            return {
                id: element.href.split('/').pop(),
                title: element.querySelector( 'p.card-title' ).textContent.trim()
            };
        });
    }

    async _getChapters( manga ) {
        let request = new Request(new URL(`/manga/${manga.id}/chaptersList`, this.url));
        let data = await this.fetchDOM(request, 'li.chapter-item');

        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('a'), request.url),
                title: element.querySelector('span.chapter-title').textContent.trim(),
                language: ''
            };
        });

    }

    async _getPages( chapter ) {
        let request = new Request(new URL(chapter.id, this.url));
        let data = await this.fetchDOM(request, 'source.img-fluid');
        return data.map( element => {
            return this.getAbsolutePath(element, request.url);
        });
    }

}