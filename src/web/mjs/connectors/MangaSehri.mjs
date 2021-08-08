import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaSehri extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangasehri';
        super.label = 'Manga Şehri';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://mangasehri.com';
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryPages);
        return data.map(element => this.getAbsolutePath(element.dataset.src || element, request.url)).filter(image => !/grumpybumpers/.test(image));
    }
}