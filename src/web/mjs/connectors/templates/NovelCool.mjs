import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

export default class Novelcool extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = undefined;
        this.url = undefined;

        this.manga_selector = 'div.book-list div.book-info a';
        this.manga_page_query = '/category/index_{page}.html'; // {page} will get replaced with the current page number
        this.chapter_selector = 'div.chapter-item-list a';
        this.page_selector = 'select.sl-page';
        this.image_selector = 'div.pic_box source.manga_pic';
        this.uri_title_selector = 'div.bookinfo-info h1.bookinfo-title';
        this.text_novel_selector = 'p.chapter-start-mark';
    }

    async _getMangas() {
        let more_pages = true;
        let page = 1;

        let mangas = [];
        while (more_pages) {
            let request = new Request(new URL(this.manga_page_query.replace('{page}', page), this.url), this.requestOptions);
            let data = await fetch(request);

            if ( data.url === this.url+this.manga_page_query.replace('{page}', page++) ) {
                data = this.createDOM(await data.text());
                data = [...data.querySelectorAll( this.manga_selector )];

                mangas.push(...data.map(manga => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink(manga, this.url),
                        title: manga.title.trim()
                    };
                }));

            } else {
                more_pages = false;
            }
        }

        return mangas;
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.chapter_selector);
        return data.map(chapter => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(chapter, this.url),
                title: chapter.title.trim()
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await fetch(request);
        data = this.createDOM( await data.text() );

        if ( data.querySelector(this.text_novel_selector) ) {
            alert(`'${chapter.manga.title}' seems to be a text novel and can therefore not be viewed nor downloaded.`, this.label, 'info');
            return;
        } else {
            let page_links = data.querySelectorAll( this.page_selector );
            return [...page_links[0].querySelectorAll('option')].map( link => this.createConnectorURI(link.value) );
        }
    }

    _handleConnectorURI( payload ) {
        let request = new Request( new URL(payload, this.url), this.requestOptions );
        return this.fetchDOM( request, this.image_selector)
            .then( data => super._handleConnectorURI( this.getAbsolutePath( data[0].src, request.url ) ) );
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.uri_title_selector);
        let id = this.getRootRelativeOrAbsoluteLink(uri.href, this.url);
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }
}