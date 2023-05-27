import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KomikLabIND extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komiklabind';
        super.label = 'KomikLab (Indo)';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://komiklab.net';
        this.path = '/manga/list-mode/';
    }

    get icon() {
        return '/img/connectors/komiklab';
    }
}
