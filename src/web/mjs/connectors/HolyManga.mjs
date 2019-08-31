import HeavenManga from './HeavenManga.mjs';

export default class HolyManga extends HeavenManga {

    constructor() {
        super();
        super.id = 'holymanga';
        super.label = 'HolyManga';
        this.tags = [ 'manga', 'english' ];
        this.url = 'http://ww4.holymanga.net';
    }
}