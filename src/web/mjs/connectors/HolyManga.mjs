import HeavenManga from './HeavenManga.mjs';

export default class HolyManga extends HeavenManga {

    constructor() {
        super();
        super.id = 'holymanga';
        super.label = 'HolyManga';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://ww5.holymanga.net';
    }
}