import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class ReadSeinen extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'readseinen';
        super.label = 'ReadSeinen';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://readseinen.com';
        this.path = '/manga/list-mode/';
    }
}