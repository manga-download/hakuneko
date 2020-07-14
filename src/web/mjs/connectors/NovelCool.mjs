import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Mangafest extends Connector {

    constructor() {
        super();
        super.id = 'novelcool';
        super.label = 'Novel Cool';
        this.tags = [ 'spanish', 'manga', 'webtoon'];
        this.url = 'https://es.novelcool.com';
    }

    async _getMangas() {
        let morePages = true;
        let page = 1;

        let mangas = [];
        while (morePages) {
            let request = new Request(new URL(`/category/index_${page}.html`, this.url), this.requestOptions);
            let data = await fetch(request);

            if ( data.url == `https://es.novelcool.com/category/index_${page++}.html` ) {
                data = this.createDOM(await data.text());
                data = [...data.querySelectorAll('div.book-list div.book-info a')];

                mangas.push(...data.map(manga => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink(manga, this.url),
                        title: manga.title.trim()
                    };
                }));
            } else {
                morePages = false;
            }
        }

        return mangas;
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.chapter-item-list a');
        return data.map(chapter => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(chapter, this.url),
                title: chapter.title.trim()
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let page_links = await this.fetchDOM(request, 'select.sl-page');
        page_links = [...page_links[0].querySelectorAll('option')].map(link => link.value);

        let pages = [];
        for( const link of page_links) {
            let request = new Request(new URL(link, this.url), this.requestOptions);
            let data = await this.fetchDOM(request, 'div.pic_box source.manga_pic');
            pages.push(data[0].src);
        }

        return pages;
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.bookinfo-info h1.bookinfo-title');
        let id = uri.href;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }
}