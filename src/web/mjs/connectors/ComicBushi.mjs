import CoreView from './templates/CoreView.mjs';

export default class ComicBushi extends CoreView {

    constructor() {
        super();
        super.id = 'comicbushi';
        super.label = 'コミックブシロードWEB (Comic Bushiroad WEB / Growl)';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://comic-growl.com';
        this.path = ['/'];
        this.queryManga = 'section#lineup ul.lineup-list div.lineup-item a';
        this.queryMangaTitle = 'h5.title';
    }

    async _getMangasFromPage(page) {
        const request = new Request(this.url + page, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryManga);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title:  element.querySelector(this.queryMangaTitle).textContent.replace(/^完結 /, '').trim()
            };
        });
    }
}
