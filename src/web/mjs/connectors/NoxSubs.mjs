import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class NoxSubs extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'noxsubs';
        super.label = 'Nox Subs';
        this.tags = [ 'webtoon', 'manga', 'turkish' ];
        this.url = 'https://noxsubs.com';
        this.path = '/manga/list-mode/';
    }
}