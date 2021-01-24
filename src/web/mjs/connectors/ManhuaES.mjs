import MojoPortalComic from './templates/MojoPortalComic.mjs';

export default class ManhuaES extends MojoPortalComic {

    constructor() {
        super();
        super.id = 'manhuaes';
        super.label = 'ManhuaES';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://manhuaes.com';

        this.path = '/category-comics/manga/';
        this.queryMangasPageCount = 'ul.pagination li:nth-last-child(2) > a';
        this.pathMatch = /(\d+)\/?$/;
        this.queryMangas = 'div.overlay a.head';
        this.queryPages = 'div.reading-detail > :not(.mrt5) source';
    }

    async _getMangasFromPage(page) {
        const uri = new URL(`${this.path}page/${page}/`, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas, 3);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }
}