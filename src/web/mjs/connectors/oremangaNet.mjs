import oremangaNet from './templates/oremangaNet.mjs';

export default class oremanga extends oremangaNet {

    constructor() {
        super();
        super.id = 'oremanga';
        super.label = 'oremanga';
        this.tags = [ 'manga', 'webtoon', 'thai' ];
        this.url = 'https://www.oremanga.net';
    }
}
