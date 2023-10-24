import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Mangalek extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangalek';
        super.label = 'مانجا ليك (Mangalek)';
        this.tags = [ 'manga', 'webtoon', 'arabic' ];
        this.url = 'https://mangaleku.com';
        this.queryTitleForURI = 'div.profile-manga div.post-title h1';
        this.requestOptions.headers.set('x-referer', this.url);
    }

}
