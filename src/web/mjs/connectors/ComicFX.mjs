import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ComicFX extends Connector {

    constructor() {
        super();
        super.id = 'comicfx';
        super.label = 'Comic FX';
        this.tags = [ 'manga', 'webtoon', 'english', 'indonesian' ];
        this.url = 'https://comicfx.net';

        this.queryChapters = 'div.chaplist ul li a:not([class])';
        this.queryPages = 'div#all source.img-responsive';
        this.language = 'id';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.bigcontent div.infokomik h2');
        return new Manga(this, uri.pathname, data[0].textContent.trim());
    }

    async _getMangas() {
        const uri = new URL('/changeMangaList?type=text', this.url);
        const request = new Request(uri, this.requestOptions);
        request.headers.set('X-Requested-With', 'XMLHttpRequest');
        const data = await this.fetchDOM(request, 'ul.manga-list li a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('h6').textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul#listch li a span.chapternum');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.closest('a'), this.url),
                title: element.textContent.trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#lcanv source.img-responsive');
        return data.map(image => this.getAbsolutePath(image.dataset.src || image, request.url));
    }
}