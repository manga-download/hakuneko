import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class SoulsSans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'soulscans';
        super.label = 'SoulsSans';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://soulscans.my.id';
        this.path = '/manga/list-mode/';
    }
}
