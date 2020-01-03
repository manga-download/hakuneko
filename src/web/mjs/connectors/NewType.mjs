import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class NewType extends Connector {

    constructor() {
        super();
        super.id = 'newtype';
        super.label = 'NewType';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://comic.webnewtype.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.Breadcrumb ul li:last-of-type');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        /*
         * Cookie: contents_list_pg=1000
         * https://comic.webnewtype.com/contents/all/
         * https://comic.webnewtype.com/contents/all/more/1/
         */
        let request = new Request(new URL('/contents/all/', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'ul#worksPanel li a div.OblongCard-content h3.OblongCard-title');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.closest('a'), request.url),
                title: element.textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        /*
         * https://comic.webnewtype.com/contents/k_pandora/
         * https://comic.webnewtype.com/contents/k_pandora/more/1/
         */
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'ul#episodeList li a div.description');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.closest('a'), request.url),
                title: element.textContent.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div#viewerContainer');
        let link = this.getAbsolutePath(data[0].dataset.url, request.url);
        data = await this.fetchJSON(new Request(link, this.requestOptions));
        return data.map(image => this.getAbsolutePath(image, request.url));
    }
}