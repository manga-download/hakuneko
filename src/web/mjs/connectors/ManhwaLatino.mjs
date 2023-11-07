import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhwaLatino extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhwalatino';
        super.label = 'Manhwa-Latino';
        this.tags = [ 'webtoon', 'hentai', 'spanish' ];
        this.url = 'https://manhwa-latino.com';
        this.requestOptions.headers.set('x-referer', this.url);

    }

    _createMangaRequest(page) {
        return new Request(new URL(`/manga/page/${page}/`, this.url), this.requestOptions);
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'li.wp-manga-chapter div.mini-letters > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.page-break source.img-responsive');
        return data.map(image => {
            const payload = {
                url : image.getAttribute('data-src'),
                referer : request.url
            };
            return this.createConnectorURI(payload);
        });
    }
}
