import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaIndoWeb extends Connector {

    constructor() {
        super();
        super.id = 'mangaindoweb';
        super.label = 'MangaIndoWeb';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://mangaindo.web.id';
        this.path = '/manga-list/';

        this.queryMangas = 'div#az-slider div.letter-section ul li.manga-list a';
        this.queryChapters = 'ul.lcp_catlist li a';
        this.queryPages = 'div.entry-content source[src]:not([src=""])';
        this.querMangaTitleFromURI = 'div#main article div.title h2';
    }

    async _getMangas(){
        const URI = new URL(this.path, this.url);
        const request = new Request(URI, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);

        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga){
        const URI = new URL(manga.id, this.url);
        const request = new Request( URI, this.requestOptions );
        let data = await this.fetchDOM(request, this.queryChapters);

        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.replace( manga.title, '' ).replace( '–', '' ).trim()
            };
        });
    }

    async _getPages(chapter){
        const URI = new URL(chapter.id, this.url);
        const request = new Request(URI, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);

        return data.map(element => this.getAbsolutePath( element, request.url ));
    }

    async _getMangaFromURI(uri){
        const URI = new URL(uri);
        const request = new Request(URI, this.requestOptions);
        const data = await this.fetchDOM(request, this.querMangaTitleFromURI);
        const title = data[0].textContent.trim();

        return new Manga(this, uri, title);
    }

}