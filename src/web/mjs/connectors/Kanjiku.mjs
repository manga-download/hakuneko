import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class Kanjiku extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'kanjiku';
        super.label = 'Kanjiku';
        this.tags = [ 'manga', 'webtoon', 'german' ];
        this.url = 'https://kanjiku.net';
    }
}