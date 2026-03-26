import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

export default class MangaReaderCMS extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [ 'manga' ];
        this.url = undefined;
        this.path = '/';

        this.queryMangas = 'ul.manga-list li a';
        this.queryChapters = 'ul.chapters li h5.chapter-title-rtl';
        this.queryPages = 'div#all source.img-responsive';
        this.queryTitleForURI = 'h1.widget-title, h2.widget-title, h2.listmanga-header';
        this.language = '';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const id = uri.pathname + uri.search;
        const data = await this.fetchDOM(request, this.queryTitleForURI);
        return new Manga(this, id, data[0].textContent.trim());
    }

    async _getMangas() {
        let request = new Request(new URL(this.path + 'changeMangaList?type=text', this.url), this.requestOptions);
        request.headers.set('X-Requested-With', 'XMLHttpRequest');
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRelativeLink(element),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            let anchor = element.nodeName.toLowerCase() === 'a' ? element : element.querySelector('a');
            return {
                id: this.getRelativeLink(anchor),
                title: element.innerText.replace(/\s*:\s*$/, '').replace(manga.title, '').trim(),
                language: this.language
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);
        return data.map(element => {
            try {
                const src = element.dataset['src'].split('://').pop();
                return decodeURIComponent(atob(src || undefined));
            } catch(error) {
                let src = (element.dataset['src'] || element.src).trim();
                return new URL(src, request.url).href;
            }
        });
    }
}