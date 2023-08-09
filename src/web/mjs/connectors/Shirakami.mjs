import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Shirakami extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'shirakami';
        super.label = 'Shirakami';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://shirakami.xyz';
        this.path = '/manga/list-mode/';
    }
}
