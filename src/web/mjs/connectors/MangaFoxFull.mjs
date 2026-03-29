import WordPressMadara from './templates/WordPressMadara.mjs';
export default class MangaFoxFull extends WordPressMadara {
    constructor() {
        super();
        super.id = 'mangafoxfull';
        super.label = 'MangaFoxFull';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://mangafoxfull.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}