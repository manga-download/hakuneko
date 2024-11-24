import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Doujinku extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'doujinku';
        super.label = 'Doujinku';
        this.tags = ['manga', 'hentai', 'indonesian'];
        this.url = 'https://doujinku.xyz';
        this.path = '/manga/list-mode/';
    }
}
