import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class LupiTeam extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'lupiteam';
        super.label = 'LupiTeam';
        this.tags = [ 'manga', 'high-quality', 'italian', 'scanlation' ];
        this.url = 'https://lupiteam.net';
        this.path = '/reader/directory/';
        this.language = 'italian';
    }
}