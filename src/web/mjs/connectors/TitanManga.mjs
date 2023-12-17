import WordPressMadara from './templates/WordPressMadara.mjs';

export default class TitanManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'titanmanga';
        super.label = 'Titan Manga';
        this.tags = [ 'manga', 'turkish', 'webtoon' ];
        this.url = 'https://titanmanga.com';
    }
}
