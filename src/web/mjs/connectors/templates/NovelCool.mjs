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

        this.novelContainerQuery = 'div.chapter-reading-section-list';
        this.novelContentQuery = 'div.chapter-reading-section.position-relative';
        this.novelObstaclesQuery = 'div.chapter-section-report.model-trigger';
        this.novelFormat = 'image/png';
        this.novelWidth = '56em';
        this.novelPadding = '1.5em';
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
            let darkmode = Engine.Settings.NovelColorProfile();
            let script = `
                new Promise(resolve => {
                    document.body.style.width = '${this.novelWidth}';
                    let container = document.querySelector('${this.novelContainerQuery}');
                    container.style.maxWidth = '${this.novelWidth}';
                    container.style.padding = '0';
                    container.style.margin = '0';
                    let novel = document.querySelector('${this.novelContentQuery}');
                    novel.style.padding = '${this.novelPadding}';
                    [...novel.querySelectorAll(":not(:empty)")].forEach(ele => {
                        ele.style.backgroundColor = '${darkmode.background}'
                        ele.style.color = '${darkmode.text}'
                    })
                    novel.style.backgroundColor = '${darkmode.background}'
                    novel.style.color = '${darkmode.text}'
                    document.querySelectorAll('${this.novelObstaclesQuery}').forEach(element => element.style.display = 'none');
                    let script = document.createElement('script');
                    script.onload = async function() {
                        let canvas = await html2canvas(novel);
                        resolve(canvas.toDataURL('${this.novelFormat}'));
                    }
                    script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
                    document.body.appendChild(script);
                });
            `;

            return [await Engine.Request.fetchUI(request, script)];
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