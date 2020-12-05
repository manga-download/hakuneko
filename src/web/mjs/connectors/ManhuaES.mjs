import MojoPortalComic from './templates/MojoPortalComic.mjs';

export default class ManhuaES extends MojoPortalComic {

    constructor() {
        super();
        super.id = 'manhuaes';
        super.label = 'ManhuaES';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://manhuaes.com';

        this.queryPages = 'div.reading-detail > :not(.mrt5) source';
    }

    async _getMangas() {
        let request = new Request(new URL('/category-comics/manga/', this.url), this.requestOptions);
        let pages = await this.fetchDOM(request, 'ul.pagination li:nth-last-child(2) > a');
        pages = Number(pages[0].text);
        let mangas = [];
        for (let page = 0; page <= pages; page++) {
            request = new Request(new URL('/category-comics/manga/page/' + page, this.url), this.requestOptions);
            let data = await this.fetchDOM(request, 'div.overlay a.head');
            mangas.push( ...data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                    title: element.text.trim()
                };
            }));
        }

        return mangas;
    }
}