import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class AnimaRegia extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'animaregia';
        super.label = 'Anima Regia';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://animaregia.net';

        this.language = 'pt';
    }
}