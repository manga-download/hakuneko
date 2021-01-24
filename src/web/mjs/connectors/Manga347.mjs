import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Manga347 extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manga347';
        super.label = 'Manga 347';
        this.tags = ['webtoon', 'english'];
        this.url = 'https://manga347.com';
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        // TODO: setting this parameter seems to be problematic for various website (e.g. ChibiManga, AniMangaES server will crash)
        uri.searchParams.set('style', 'list');
        let request = new Request(uri, this.requestOptions);
        let data1 = await this.fetchDOM(request, 'body');
        let data = [...data1[0].querySelectorAll('figure source').length > 0 ? data1[0].querySelectorAll('figure source') : data1[0].querySelectorAll('div.page-break source')];
        return data.map(element => this.createConnectorURI({
            // HACK: bypass 'i0.wp.com' image CDN to ensure original images are loaded directly from host
            url: this.getAbsolutePath(element.dataset['src'] || element['srcset'] || element, request.url).replace(/\/i\d+\.wp\.com/, ''),
            referer: request.url
        }));
    }
}