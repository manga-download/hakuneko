import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MangaGenki extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangagenki';
        super.label = 'MangaGenki';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://mangagenki.com';
        this.path = '/manga/?list';
    }
}