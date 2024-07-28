import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MangasChan extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangaschan';
        super.label = 'Mangás Chan';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://mangaschan.net';
        this.path = '/manga/list-mode/';
    }
}
