import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Japanime extends WordPressMadara {

    constructor() {
        super();
        super.id = 'japanime';
        super.label = 'Japanime';
        this.tags = [ 'manga', 'webtoon', 'french' ];
        this.url = 'https://japanime.ch';
    }
}