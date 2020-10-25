import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Manga3S extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manga3s';
        super.label = 'Manga3S';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://manga3s.com';
    }
}