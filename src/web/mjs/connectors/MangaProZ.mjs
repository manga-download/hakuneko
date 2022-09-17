import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MangaProZ extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangaproz';
        super.label = 'Manga Pro Z';
        this.tags = [ 'manga', 'webtoon', 'arabic' ];
        this.url = 'https://mangaprotm.com';
        this.path = '/manga/list-mode/';
    }
}
