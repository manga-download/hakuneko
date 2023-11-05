import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Tempestfansub extends WordPressMangastream {
constructor() {
    super();
    super.id = 'tempestfansub';
    super.label = 'Tempestfansub';
    this.tags = [ 'webtoon', 'manga', 'turkish' ];
    this.url = 'https://tempestfansub.com';
    this.path = '/manga/list-mode/';
}

async _getMangasFromPage(page) {
    const uri = new URL('/manga/?page=' + page, this.url);
    const request = new Request(uri, this.requestOptions);
    let data = await this.fetchDOM(request, 'div.bs div.bsx > a');
    return data.map(element => {
        return {
            id: this.getRootRelativeOrAbsoluteLink(element, request.url),
            title: element.title.trim()
        };
    });
}
