import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class NirvanaManga extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'nirvanamanga';
        super.label = 'NirvanaManga';
        this.tags = ['manga', 'turkish'];
        this.url = 'https://nirvanamanga.com';
        this.path = '/manga/list-mode/';
    }
}
