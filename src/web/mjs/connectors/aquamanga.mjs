import WordPressMadara from './templates/WordPressMadara.mjs';

export default class AquaManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'aquamanga';
        super.label = 'AquaManga';
        this.tags = [ 'manga', 'english', 'webtoon' ];
        this.url = 'https://aquamanga.com';
    }
}
