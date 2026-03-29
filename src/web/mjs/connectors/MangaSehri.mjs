import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaSehri extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangasehri';
        super.label = 'Manga Şehri';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://manga-sehri.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryPages);
        const images = data.map(element =>this.getAbsolutePath(element.dataset.src || element, request.url)).filter(image => !/grumpybumpers/.test(image));
        return images.map(image => this.createConnectorURI({url : image, referer : this.url}));
    }
}
