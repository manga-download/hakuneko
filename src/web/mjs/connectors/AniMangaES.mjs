import WordPressMadara from './templates/WordPressMadara.mjs';

export default class AniMangaES extends WordPressMadara {

    constructor() {
        super();
        super.id = 'animangaes';
        super.label = 'ANIMANGAES';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://animangaes.com';

        this.queryPages = 'div.reading-content p source';
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);
        return data.map(element => this.createConnectorURI({
            url: this.getAbsolutePath(element.dataset['src'] || element['srcset'] || element, request.url),
            referer: request.url
        }));
    }
}